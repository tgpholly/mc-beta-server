import { FunkyArray } from "../funkyArray";
import { Chunk } from "./Chunk";
import { IEntity } from "./entities/IEntity";
import { FlatGenerator } from "./generators/Flat";
import { IGenerator } from "./generators/IGenerator";

export class World {
	public chunks:FunkyArray<number, Chunk>;
	public entites:FunkyArray<number, IEntity>;

	public generator:IGenerator;

	public constructor() {
		this.chunks = new FunkyArray<number, Chunk>();
		this.entites = new FunkyArray<number, IEntity>();
		this.generator = new FlatGenerator();
		this.chunks.set(Chunk.CreateCoordPair(0, 0), new Chunk(this, 0, 0));
	}

	public addEntity(entity:IEntity) {
		this.entites.set(entity.entityId, entity);
	}

	public removeEntity(entity:IEntity|number) {
		if (typeof(entity) === "number") {
			return this.entites.remove(entity);
		}

		return this.entites.remove(entity.entityId);
	}

	public getChunk(x:number, z:number) {
		return this.chunks.get(Chunk.CreateCoordPair(x, z));
	}

	public tick(tickCount:number) {
		
	}
}