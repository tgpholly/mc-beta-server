import { Endian, createWriter } from "bufferstuff";
import FunkyArray from "funky-array";
import { Chunk } from "./Chunk";
import { WorldSaveManager } from "./WorldSaveManager";
import { Block } from "./blocks/Block";
import { EntityItem } from "./entities/EntityItem";
import { IEntity } from "./entities/IEntity";
import { Player } from "./entities/Player";
//import { FlatGenerator } from "./generators/Flat";
import { HillyGenerator } from "./generators/Hilly";
import { IGenerator } from "./generators/IGenerator";
import { PacketBlockChange } from "./packets/BlockChange";
import { PacketDestroyEntity } from "./packets/DestroyEntity";
import { PacketPickupSpawn } from "./packets/PickupSpawn";
import { QueuedBlockUpdate } from "./queuedUpdateTypes/BlockUpdate";
import { IQueuedUpdate } from "./queuedUpdateTypes/IQueuedUpdate";
import AABB from "./AABB";

export class World {
	public static ENTITY_MAX_SEND_DISTANCE = 50;
	private static READ_CHUNKS_FROM_DISK = true;

	private readonly saveManager;
	private readonly chunksOnDisk:Array<number>;

	public chunks:FunkyArray<number, Chunk>;
	public entites:FunkyArray<number, IEntity>;
	public players:FunkyArray<number, Player>;
	public playerHitboxes:FunkyArray<number, AABB>;

	public queuedChunkBlocks:Array<IQueuedUpdate>;
	public queuedUpdates:Array<IQueuedUpdate>;
	public generator:IGenerator;

	public readonly dimension:number;

	public constructor(saveManager:WorldSaveManager, dimension:number, seed:number, generator:IGenerator) {
		this.dimension = dimension;
		this.saveManager = saveManager;
		this.chunksOnDisk = this.saveManager.chunksOnDisk.get(dimension) ?? new Array<number>;

		this.chunks = new FunkyArray<number, Chunk>();
		this.entites = new FunkyArray<number, IEntity>();
		this.players = new FunkyArray<number, Player>();
		this.playerHitboxes = new  FunkyArray<number, AABB>();
		this.queuedChunkBlocks = new Array<IQueuedUpdate>();
		this.queuedUpdates = new Array<IQueuedUpdate>();
		this.generator = generator;
	}

	public addEntity(entity:IEntity) {
		this.entites.set(entity.entityId, entity);
		this.playerHitboxes.set(entity.entityId, entity.entityAABB);
		if (entity instanceof Player) {
			this.players.set(entity.entityId, entity);
		} else if (entity instanceof EntityItem) {
			const packet = new PacketPickupSpawn(entity.entityId, entity.itemStack.itemID, entity.itemStack.size, entity.itemStack.damage, Math.round(entity.position.x * 32), Math.round(entity.position.y * 32), Math.round(entity.position.z * 32), 0, 0, 0).writeData();
			entity.sendToNearby(packet);
		}
	}

	// TODO: getChunkByCoordPair failed in here during removeEntity, figure out why.
	public removeEntity(entity:IEntity) {
		if (entity instanceof Player) {
			for (const coordPair of entity.loadedChunks) {
				if (this.chunkExists(coordPair)) {
					const chunk = this.getChunkByCoordPair(coordPair);
					chunk.playersInChunk.remove(entity.entityId);

					if (!chunk.forceLoaded && chunk.playersInChunk.length === 0) {
						this.unloadChunk(coordPair);
					}
				}
			}
			// Clear player chunk list (they may be switching dimensions)
			entity.loadedChunks = new Array<number>();
			entity.justUnloaded = new Array<number>();

			this.playerHitboxes.remove(entity.entityId);
			this.players.remove(entity.entityId);

			if (!entity.isDead) {
				const writer = createWriter(Endian.BE);
				entity.toSave(writer);

				this.saveManager.writePlayerSaveToDisk(entity.username, writer);
			}
		}

		this.entites.remove(entity.entityId);
		this.sendToNearbyClients(entity, new PacketDestroyEntity(entity.entityId).writeData());
	}

	public chunkExists(coordPairOrX:number, chunkZ?:number) {
		if (typeof(coordPairOrX) === "number" && typeof(chunkZ) === "number") {
			return this.chunks.has(Chunk.CreateCoordPair(coordPairOrX, chunkZ));
		}

		return this.chunks.has(coordPairOrX);
	}

	public getChunk(x:number, z:number) {
		const coordPair = Chunk.CreateCoordPair(x, z);
		const existingChunk = this.chunks.get(coordPair);
		if (!(existingChunk instanceof Chunk)) {
			throw new Error(`BADLOOKUP: Chunk [${x}, ${z}] does not exist.`);
		}

		return existingChunk;
	}

	public getChunkSafe(x:number, z:number) {
		return new Promise<Chunk>((resolve) => {
			const coordPair = Chunk.CreateCoordPair(x, z);
			const existingChunk = this.chunks.get(coordPair);
			if (!(existingChunk instanceof Chunk)) {
				if (World.READ_CHUNKS_FROM_DISK && this.chunksOnDisk.includes(coordPair)) {
					return this.saveManager.readChunkFromDisk(this, x, z)
						.then(chunk => resolve(this.chunks.set(coordPair, chunk)));
				} else {
					resolve(this.chunks.set(coordPair, new Chunk(this, x, z, true)));
					if (World.READ_CHUNKS_FROM_DISK) {
						this.saveManager.writeChunkToDisk(this.getChunk(x, z));
					}
					return;
				}
			}

			resolve(existingChunk);
		});
	}

	public getChunkByCoordPair(coordPair:number) {
		const existingChunk = this.chunks.get(coordPair);
		if (!(existingChunk instanceof Chunk)) {
			throw new Error(`BADLOOKUP: Chunk ${coordPair} does not exist.`);
		}

		return existingChunk;
	}

	public getBlockId(x:number, y:number, z:number) {
		const chunkX = x >> 4,
			  chunkZ = z >> 4;

		return this.getChunk(chunkX, chunkZ).getBlockId(x & 0xf, y, z & 0xf);
	}

	public getChunkBlockId(chunk:Chunk, x:number, y:number, z:number) {
		return chunk.getBlockId(x & 0xf, y, z & 0xf);
	}

	public getBlockMetadata(x:number, y:number, z:number) {
		const chunkX = x >> 4,
			  chunkZ = z >> 4;

		return this.getChunk(chunkX, chunkZ).getBlockMetadata(x & 0xf, y, z & 0xf);
	}

	public getChunkBlockMetadata(chunk:Chunk, x:number, y:number, z:number) {
		return chunk.getBlockMetadata(x & 0xf, y, z & 0xf);
	}

	public setBlock(blockId:number, x:number, y:number, z:number, doBlockUpdate?:boolean) {
		const chunkX = x >> 4,
			  chunkZ = z >> 4;

		const chunk = this.getChunk(chunkX, chunkZ);
		chunk.setBlockWithMetadata(blockId, 0, x & 0xf, y, z & 0xf);

		if (doBlockUpdate) {
			const blockUpdatePacket = new PacketBlockChange(x, y, z, blockId, 0).writeData();
			// Send block update to all players that have this chunk loaded
			chunk.playersInChunk.forEach(player => {
				player.mpClient?.send(blockUpdatePacket);
			});
		}
	}

	public setBlockWithMetadata(blockId:number, metadata:number, x:number, y:number, z:number, doBlockUpdate?:boolean) {
		const chunkX = x >> 4,
			  chunkZ = z >> 4;

		const chunk = this.getChunk(chunkX, chunkZ);
		chunk.setBlockWithMetadata(blockId, metadata, x & 0xf, y, z & 0xf);

		if (doBlockUpdate) {
			const blockUpdatePacket = new PacketBlockChange(x, y, z, blockId, metadata).writeData(); // TODO: Handle metadata
			// Send block update to all players that have this chunk loaded
			chunk.playersInChunk.forEach(player => {
				player.mpClient?.send(blockUpdatePacket);
			});
		}
	}

	public setBlockWithNotify(x:number, y:number, z:number, blockId:number) {
		this.setBlock(blockId, x, y, z, true);
		this.notifyNeighborBlocksOfChange(x, y, z, blockId);
	}
	
	public setBlockAndMetadataWithNotify(x:number, y:number, z:number, blockId:number, metadata:number) {
		this.setBlockWithMetadata(blockId, metadata, x, y, z, true);
		this.notifyNeighborBlocksOfChange(x, y, z, blockId);
	}

	public notifyNeighborBlocksOfChange(x:number, y:number, z:number, blockId:number) {
		this.notifyNeighborBlockOfChange(x - 1, y, z, blockId);
		this.notifyNeighborBlockOfChange(x + 1, y, z, blockId);
		this.notifyNeighborBlockOfChange(x, y - 1, z, blockId);
		this.notifyNeighborBlockOfChange(x, y + 1, z, blockId);
		this.notifyNeighborBlockOfChange(x, y, z - 1, blockId);
		this.notifyNeighborBlockOfChange(x, y, z + 1, blockId);
	}

	private notifyNeighborBlockOfChange(x:number, y:number, z:number, blockId:number) {
		const block = Block.blocks[this.getBlockId(x, y, z)];
		if (block != null && block.blockId !== 0) {
			block.neighborBlockChange(this, x, y, z, block.blockId);
		}
	}

	public sendToNearbyClients(sentFrom:IEntity, buffer:Buffer) {
		this.players.forEach(player => {
			if (sentFrom.entityId !== player.entityId && Math.abs(sentFrom.distanceTo(player)) < World.ENTITY_MAX_SEND_DISTANCE) {
				player.mpClient?.send(buffer);
			}
		});
	}

	public sendToNearbyAllNearbyClients(sentFrom:IEntity, buffer:Buffer) {
		this.players.forEach(player => {
			if (Math.abs(sentFrom.distanceTo(player)) < World.ENTITY_MAX_SEND_DISTANCE) {
				player.mpClient?.send(buffer);
			}
		});
	}

	public async unloadChunk(coordPair:number) {
		const chunk = this.getChunkByCoordPair(coordPair);
		if (!chunk.savingToDisk) {
			chunk.savingToDisk = true;

			await this.saveManager.writeChunkToDisk(chunk);

			if (chunk.playersInChunk.length === 0) {
				this.chunks.remove(coordPair);
				return;				
			}

			// A player loaded the chunk while we were, flushing to disk.
			// Keep it loaded.
			chunk.savingToDisk = false;
		}
	}

	public tick() {
		if (this.queuedUpdates.length > 0) {
			for (let i = this.queuedUpdates.length - 1; i >= 0; i--) {
				const update = this.queuedUpdates[i];
				if (update instanceof QueuedBlockUpdate) {
					if (this.chunks.keys.includes(update.coordPair)) {
						this.queuedUpdates.splice(i, 1);
						const thatChunk = this.getChunkByCoordPair(update.coordPair);
						thatChunk.setBlockWithMetadata(update.blockId, update.metadata, update.x, update.y, update.z);
						if (thatChunk.playersInChunk.length > 0) {
							const blockUpdate = new PacketBlockChange((thatChunk.x << 4) + update.x, update.y, (thatChunk.z << 4) + update.z, update.blockId, update.metadata).writeData()
							thatChunk.playersInChunk.forEach(player => {
								player.mpClient?.send(blockUpdate);
							});
						}
					}
				}
			}
		}

		this.entites.forEach(entity => {
			entity.onTick();

			if (entity instanceof Player) {
				if (entity.justUnloaded.length > 0) {
					for (const coordPair of entity.justUnloaded) {
						if (this.chunks.get(coordPair) != undefined) {
							const chunkToUnload = this.getChunkByCoordPair(coordPair);
							chunkToUnload.playersInChunk.remove(entity.entityId);
							if (!chunkToUnload.forceLoaded && chunkToUnload.playersInChunk.length === 0) {
								this.unloadChunk(coordPair);
							}
						}
					}

					entity.justUnloaded = new Array<number>();
				}
			}

			if (entity.markedForDisposal) {
				this.removeEntity(entity);
			}
		})
	}
}