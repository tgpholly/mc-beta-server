import { FunkyArray } from "../funkyArray";
import { Chunk } from "./Chunk";
import { WorldSaveManager } from "./WorldSaveManager";
import { IEntity } from "./entities/IEntity";
import { Player } from "./entities/Player";
//import { FlatGenerator } from "./generators/Flat";
import { HillyGenerator } from "./generators/Hilly";
import { IGenerator } from "./generators/IGenerator";
import { PacketBlockChange } from "./packets/BlockChange";

export class World {
	public static ENTITY_MAX_SEND_DISTANCE = 50;

	private readonly saveManager;

	public chunks:FunkyArray<number, Chunk>;
	public entites:FunkyArray<number, IEntity>;
	public players:FunkyArray<number, Player>;

	public generator:IGenerator;

	public constructor(saveManager:WorldSaveManager, seed:number) {
		this.saveManager = saveManager;

		this.chunks = new FunkyArray<number, Chunk>();
		this.entites = new FunkyArray<number, IEntity>();
		this.players = new FunkyArray<number, Player>();
		this.generator = new HillyGenerator(seed);
	}

	public addEntity(entity:IEntity) {
		this.entites.set(entity.entityId, entity);
		if (entity instanceof Player) {
			this.players.set(entity.entityId, entity);
		}
	}

	// TODO: getChunkByCoordPair failed in here during removeEntity, figure out why.
	public removeEntity(entity:IEntity) {
		if (entity instanceof Player) {
			for (const coordPair of entity.loadedChunks) {
				const chunk = this.getChunkByCoordPair(coordPair);
				chunk.playersInChunk.remove(entity.entityId);

				if (!chunk.forceLoaded && chunk.playersInChunk.length === 0) {
					this.unloadChunk(coordPair);
				}
			}
			this.players.remove(entity.entityId);
		}

		this.entites.remove(entity.entityId);
		// TODO: Inform clients about entity removal
	}

	public getChunk(x:number, z:number, generate:boolean = true) {
		const coordPair = Chunk.CreateCoordPair(x, z);
		const existingChunk = this.chunks.get(coordPair);
		if (!(existingChunk instanceof Chunk)) {
			throw new Error(`BADLOOKUP: Chunk [${x}, ${z}] does not exist.`);
		}

		return existingChunk;
	}

	public getChunkSafe(x:number, z:number) {
		return new Promise<Chunk>((resolve, reject) => {
			const coordPair = Chunk.CreateCoordPair(x, z);
			const existingChunk = this.chunks.get(coordPair);
			if (!(existingChunk instanceof Chunk)) {
				if (this.saveManager.chunksOnDisk.includes(coordPair)) {
					return this.saveManager.readChunkFromDisk(this, x, z)
						.then(chunk => {
							//console.log("Loaded " + x + "," + z + " from disk");
							resolve(this.chunks.set(coordPair, chunk));		
						});
				} else {
					return resolve(this.chunks.set(coordPair, new Chunk(this, x, z, true)));
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

	public getBlockMetadata(x:number, y:number, z:number) {
		const chunkX = x >> 4,
			  chunkZ = z >> 4;

		return this.getChunk(chunkX, chunkZ).getBlockMetadata(x & 0xf, y, z & 0xf);
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

	public sendToNearbyClients(sentFrom:IEntity, buffer:Buffer) {
		this.players.forEach(player => {
			if (sentFrom.entityId !== player.entityId && Math.abs(sentFrom.distanceTo(player)) < World.ENTITY_MAX_SEND_DISTANCE) {
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
		this.entites.forEach(entity => {
			entity.onTick();

			if (entity instanceof Player) {
				if (entity.justUnloaded.length > 0) {
					for (const coordPair of entity.justUnloaded) {
						const chunkToUnload = this.getChunkByCoordPair(coordPair);
						chunkToUnload.playersInChunk.remove(entity.entityId);
						if (!chunkToUnload.forceLoaded && chunkToUnload.playersInChunk.length === 0) {
							this.unloadChunk(coordPair);
						}
					}

					entity.justUnloaded = new Array<number>();
				}
			}
		})
	}
}