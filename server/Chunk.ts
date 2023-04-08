import { Block } from "./blocks/Block";
import { World } from "./World";

export class Chunk {
	private readonly MAX_HEIGHT:number = 128;
	private readonly world:World;
	private readonly x:number;
	private readonly z:number;

	private blocks:Uint8Array;

	public static CreateCoordPair(x:number, z:number) {
		return (x >= 0 ? 0 : 2147483648) | (x & 0x7fff) << 16 | (z >= 0 ? 0 : 0x8000) | z & 0x7fff;
	}

	public constructor(world:World, x:number, z:number) {
		this.world = world;
		this.x = x;
		this.z = z;
		this.blocks = new Uint8Array(16 * 16 * this.MAX_HEIGHT);

		this.world.generator.generate(this);
	}

	public setBlock(blockId:number, x:number, y:number, z:number) {
		this.blocks[x << 11 | z << 7 | y] = blockId;
	}

	public getBlockId(x:number, y:number, z:number) {
		return this.blocks[x << 11 | z << 7 | y];
	}

	public getData() {
		return this.blocks;
	}
}