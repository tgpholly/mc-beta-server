import { FunkyArray } from "../funkyArray";
import { NibbleArray } from "../nibbleArray";
import { Block } from "./blocks/Block";
import { Player } from "./entities/Player";
import { QueuedBlockUpdate } from "./queuedUpdateTypes/BlockUpdate";
import { World } from "./World";

export class Chunk {
	private readonly MAX_HEIGHT:number = 128;
	public readonly world:World;
	public readonly x:number;
	public readonly z:number;
	public readonly playersInChunk:FunkyArray<number, Player>;

	public savingToDisk:boolean = false;
	public forceLoaded:boolean = false;

	private blocks:Uint8Array;
	private metadata:NibbleArray;
	public skyLight:NibbleArray;
	public blockLight:NibbleArray;

	public static CreateCoordPair(x:number, z:number) {
		return (x >= 0 ? 0 : 2147483648) | (x & 0x7fff) << 16 | (z >= 0 ? 0 : 0x8000) | z & 0x7fff;
	}

	public constructor(world:World, x:number, z:number, generateOrBlockData?:boolean|Uint8Array, metadata?:Uint8Array, blockLight?:Uint8Array, skyLight?:Uint8Array) {
		this.world = world;
		this.x = x;
		this.z = z;
		this.playersInChunk = new FunkyArray<number, Player>();

		if (generateOrBlockData instanceof Uint8Array && metadata instanceof Uint8Array && blockLight instanceof Uint8Array && skyLight instanceof Uint8Array) {
			this.blocks = new Uint8Array(generateOrBlockData);
			this.metadata = new NibbleArray(metadata);
			this.skyLight = new NibbleArray(blockLight);
			this.blockLight = new NibbleArray(skyLight);
		} else if (generateOrBlockData instanceof Uint8Array && metadata instanceof Uint8Array && !(blockLight instanceof Uint8Array) && !(skyLight instanceof Uint8Array)) {
			this.blocks = new Uint8Array(generateOrBlockData);
			this.metadata = new NibbleArray(metadata);
			this.skyLight = new NibbleArray(16 * 16 * this.MAX_HEIGHT);
			this.blockLight = new NibbleArray(16 * 16 * this.MAX_HEIGHT);
			this.calculateLighting();
		} else {
			this.blocks = new Uint8Array(16 * 16 * this.MAX_HEIGHT);
			this.metadata = new NibbleArray(16 * 16 * this.MAX_HEIGHT);
			this.skyLight = new NibbleArray(16 * 16 * this.MAX_HEIGHT);
			this.blockLight = new NibbleArray(16 * 16 * this.MAX_HEIGHT);

			if (typeof(generateOrBlockData) === "boolean" && generateOrBlockData) {
				this.world.generator.generate(this);
				this.calculateLighting();
			}
		}
	}

	public getTopBlockY(x:number, z:number) {
		let castY = this.MAX_HEIGHT;
		while (castY-- > 0) {
			if (this.getBlockId(x >>> 0, castY, z >>> 0) !== 0) {
				break;
			}
		}
		return castY;
	}

	public calculateLighting() {
		let blockId = 0;
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				let colLight = 255;
				for (let y = this.MAX_HEIGHT - 1; y > 0; y--) {
					blockId = this.getBlockId(x, y, z);
					if (blockId == 0) {
						if (colLight <= 0) {
							this.setBlockLight(0, x, y, z);
							this.setSkyLight(0, x, y, z);
						} else {
							this.setBlockLight(Math.round((colLight / 255) * 15), x, y, z);
							this.setSkyLight(Math.round((colLight / 255) * 15), x, y, z);
						}
					} else {
						if (colLight <= 0) {
							this.setBlockLight(0, x, y, z);
						} else {
							this.setBlockLight(Math.round((colLight / 255) * 15), x, y, z);
							colLight -= (255 - Block.blocks[blockId].lightPassage);
						}
					}
				}
			}
		}
	}

	public queueBlockUpdateForOuterChunkBlock(blockId:number, metadata:number, x:number, y:number, z:number) {
		const cPair = Chunk.CreateCoordPair(this.x + (x >> 4), this.z + (z >> 4));
		if (this.world.chunks.keys.includes(cPair)) {
			this.world.queuedUpdates.push(new QueuedBlockUpdate(cPair, x & 0xf, y, z & 0xf, blockId, metadata));
		} else {
			this.world.queuedChunkBlocks.push(new QueuedBlockUpdate(cPair, x & 0xf, y, z & 0xf, blockId, metadata));
		}
	}

	public setBlock(blockId:number, x:number, y:number, z:number) {
		if (x < 0 || x > 15 || y < 0 || y > 127 || z < 0 || z > 15) {
			this.queueBlockUpdateForOuterChunkBlock(blockId, 0, x, y, z);
			return;
		}
		
		this.blocks[x << 11 | z << 7 | y] = blockId;
	}

	public setBlockWithMetadata(blockId:number, metadata:number, x:number, y:number, z:number) {
		if (x < 0 || x > 15 || y < 0 || y > 127 || z < 0 || z > 15) {
			this.queueBlockUpdateForOuterChunkBlock(blockId, metadata, x, y, z);
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

	public getBlockLight(x:number, y:number, z:number) {
		return this.blockLight.get(x << 11 | z << 7 | y);
	}

	public setBlockLight(value:number, x:number, y:number, z:number) {
		return this.blockLight.set(x << 11 | z << 7 | y, value);
	}

	public getSkyLight(x:number, y:number, z:number) {
		return this.skyLight.get(x << 11 | z << 7 | y);
	}

	public setSkyLight(value:number, x:number, y:number, z:number) {
		return this.skyLight.set(x << 11 | z << 7 | y, value);
	}

	public getBlockBuffer() {
		return Buffer.from(this.blocks);
	}

	public getMetadataBuffer() {
		return this.metadata.toBuffer();
	}

	public getBlockLightBuffer() {
		return this.metadata.toBuffer();
	}

	public getSkyLightBuffer() {
		return this.metadata.toBuffer();
	}

	public getData() {
		return this.blocks;
	}
}