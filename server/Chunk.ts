import { FunkyArray } from "../funkyArray";
import { NibbleArray } from "../nibbleArray";
import { Player } from "./entities/Player";
import { World } from "./World";

export class Chunk {
	private readonly MAX_HEIGHT:number = 128;
	private readonly world:World;
	public readonly x:number;
	public readonly z:number;
	public readonly playersInChunk:FunkyArray<number, Player>;

	public savingToDisk:boolean = false;
	public forceLoaded:boolean = false;

	private blocks:Uint8Array;
	private metadata:NibbleArray;

	public static CreateCoordPair(x:number, z:number) {
		return (x >= 0 ? 0 : 2147483648) | (x & 0x7fff) << 16 | (z >= 0 ? 0 : 0x8000) | z & 0x7fff;
	}

	public constructor(world:World, x:number, z:number, generateOrBlockData?:boolean|Uint8Array, metadata?:Uint8Array) {
		this.world = world;
		this.x = x;
		this.z = z;
		this.playersInChunk = new FunkyArray<number, Player>();

		if (generateOrBlockData instanceof Uint8Array && metadata instanceof Uint8Array) {
			this.blocks = new Uint8Array(generateOrBlockData);
			this.metadata = new NibbleArray(metadata);
		} else {
			this.blocks = new Uint8Array(16 * 16 * this.MAX_HEIGHT);
			this.metadata = new NibbleArray(16 * 16 * this.MAX_HEIGHT);

			if (typeof(generateOrBlockData) === "boolean" && generateOrBlockData) {
				this.world.generator.generate(this);
			}
		}
	}

	public setBlock(blockId:number, x:number, y:number, z:number) {
		if (x < 0 || x > 15 || y < 0 || y > 127 || z < 0 || z > 15) {
			return;
		}
		
		this.blocks[x << 11 | z << 7 | y] = blockId;
	}

	public setBlockWithMetadata(blockId:number, metadata:number, x:number, y:number, z:number) {
		if (x < 0 || x > 15 || y < 0 || y > 127 || z < 0 || z > 15) {
			return;
		}
		x = x << 11 | z << 7 | y;

		this.blocks[x] = blockId;
		this.metadata.set(x, metadata);
	}

	public getBlockId(x:number, y:number, z:number) {
		return this.blocks[x << 11 | z << 7 | y];
	}

	public getBlockMetadata(x:number, y:number, z:number) {
		return this.metadata.get(x << 11 | z << 7 | y);
	}

	public getMetadataBuffer() {
		return this.metadata.toBuffer();
	}

	public getData() {
		return this.blocks;
	}
}