import { FunkyArray } from "../funkyArray";
import { Chunk } from "./Chunk";
import { IEntity } from "./entities/IEntity";
import { Player } from "./entities/Player";
//import { FlatGenerator } from "./generators/Flat";
import { HillyGenerator } from "./generators/Hilly";
import { IGenerator } from "./generators/IGenerator";

export class World {
	public chunks:FunkyArray<number, Chunk>;
	public entites:FunkyArray<number, IEntity>;

	public generator:IGenerator;

	public constructor(seed:number) {
		this.chunks = new FunkyArray<number, Chunk>();
		this.entites = new FunkyArray<number, IEntity>();
		this.generator = new HillyGenerator(seed);
	}

	public addEntity(entity:IEntity) {
		this.entites.set(entity.entityId, entity);
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

			entity.onTick();
		})
	}
}