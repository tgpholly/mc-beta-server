import { FunkyArray } from "../funkyArray";
import { Chunk } from "./Chunk";
import { IEntity } from "./entities/IEntity";
import { Player } from "./entities/Player";
//import { FlatGenerator } from "./generators/Flat";
import { HillyGenerator } from "./generators/Hilly";
import { IGenerator } from "./generators/IGenerator";

export class World {
	public static ENTITY_MAX_SEND_DISTANCE = 50;

	public chunks:FunkyArray<number, Chunk>;
	public entites:FunkyArray<number, IEntity>;
	public players:FunkyArray<number, Player>;

	public generator:IGenerator;

	public constructor(seed:number) {
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

				if (chunk.playersInChunk.length === 0) {
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
			if (generate) {
				return this.chunks.set(coordPair, new Chunk(this, x, z));
			}

			throw new Error(`BADLOOKUP: Chunk [${x}, ${z}] does not exist.`);
		}

		return existingChunk;
	}

	public sendToNearbyClients(sentFrom:IEntity, buffer:Buffer) {
		this.players.forEach(player => {
			if (sentFrom.entityId !== player.entityId && Math.abs(sentFrom.distanceTo(player)) < World.ENTITY_MAX_SEND_DISTANCE) {
				player.mpClient?.send(buffer);
			}
		});
	}

	public getChunkByCoordPair(coordPair:number) {
		const existingChunk = this.chunks.get(coordPair);
		if (!(existingChunk instanceof Chunk)) {
			throw new Error(`BADLOOKUP: Chunk ${coordPair} does not exist.`);
		}

		return existingChunk;
	}

	public unloadChunk(coordPair:number) {
		// TODO: Save to disk
		this.chunks.remove(coordPair);
	}

	public tick() {
		this.entites.forEach(entity => {
			entity.onTick();

			if (entity instanceof Player) {
				if (entity.justUnloaded.length > 0) {
					for (const coordPair of entity.justUnloaded) {
						const chunkToUnload = this.getChunkByCoordPair(coordPair);
						chunkToUnload.playersInChunk.remove(entity.entityId);
						if (chunkToUnload.playersInChunk.length === 0) {
							this.unloadChunk(coordPair);
						}
					}

					entity.justUnloaded = new Array<number>();
				}
			}
		})
	}
}