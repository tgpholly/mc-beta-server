import { Block } from "../blocks/Block";
import { Chunk } from "../Chunk";
import { IGenerator } from "./IGenerator";
import { Noise2D, makeNoise2D } from "../../external/OpenSimplex2D";
import shuffle_seed from "../../external/shuffle_seed";

export class HillyGenerator implements IGenerator {
	private seed:number;
	private generator:Noise2D;
	private generator1:Noise2D;
	private generator2:Noise2D;
	private generator3:Noise2D;
	private generator4:Noise2D;
	private generator5:Noise2D;
	private generator6:Noise2D;
	private oceanGenerator:Noise2D;
	private mountainGenerator:Noise2D;

	public constructor(seed:number) {
		this.seed = seed;

		const generatorSeed = this.mulberry32(this.seed);
		this.generator = makeNoise2D(generatorSeed() * Number.MAX_SAFE_INTEGER);
		this.generator1 = makeNoise2D(generatorSeed() * Number.MAX_SAFE_INTEGER);
		this.generator2 = makeNoise2D(generatorSeed() * Number.MAX_SAFE_INTEGER);
		this.generator3 = makeNoise2D(generatorSeed() * Number.MAX_SAFE_INTEGER);
		this.generator4 = makeNoise2D(generatorSeed() * Number.MAX_SAFE_INTEGER);
		this.generator5 = makeNoise2D(generatorSeed() * Number.MAX_SAFE_INTEGER);
		this.generator6 = makeNoise2D(generatorSeed() * Number.MAX_SAFE_INTEGER);
		this.oceanGenerator = makeNoise2D(generatorSeed() * Number.MAX_SAFE_INTEGER);
		this.mountainGenerator = makeNoise2D(generatorSeed() * Number.MAX_SAFE_INTEGER);
	}

	// https://stackoverflow.com/a/47593316
	// This is good enough (and fast enough) for what is needed here.
	private mulberry32(a:number) {
		return function() {
			var t = a += 0x6D2B79F5;
			t = Math.imul(t ^ t >>> 15, t | 1);
			t ^= t + Math.imul(t ^ t >>> 7, t | 61);
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		}
	}

	public generate(chunk:Chunk) {
		const treeRNG = this.mulberry32(this.seed + chunk.x + chunk.z);
		let colY = 0, colDirtMin = 0, colWaterY = 0, orgColY = 0;
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				const oceanValue = this.oceanGenerator((chunk.x * 16 + x) / 128, (chunk.z * 16 + z) / 128) * 100;
				orgColY = colWaterY = colY = 60 + (
					this.generator((chunk.x * 16 + x) / 16, (chunk.z * 16 + z) / 16) * 16 +
					this.generator1((chunk.x * 16 + x) / 16, (chunk.z * 16 + z) / 16) * 16 +
					this.generator2((chunk.x * 16 + x) / 8, (chunk.z * 16 + z) / 8) * 8 +
					this.generator3((chunk.x * 16 + x) / 4, (chunk.z * 16 + z) / 4) * 4 +
					this.generator4((chunk.x * 16 + x) / 4, (chunk.z * 16 + z) / 4) * 4 +
					this.generator5((chunk.x * 16 + x) / 10, (chunk.z * 16 + z) / 10) * 10 +
					this.generator6((chunk.x * 16 + x) / 16, (chunk.z * 16 + z) / 16) * 16 +
					oceanValue +
					(Math.max(this.mountainGenerator((chunk.x * 16 + x) / 128, (chunk.z * 16 + z) / 128), 0) * 50 + Math.min(oceanValue, 0))
				) / 9;
				colDirtMin = colY - 2;
				chunk.setBlock(Block.grass.blockId, x, colY, z);

				while (colY-- > 0) {
					if (colY >= colDirtMin) {
						chunk.setBlock(Block.dirt.blockId, x, colY, z);
					} else if (colY === 0) {
						chunk.setBlock(Block.bedrock.blockId, x, colY, z);
					} else {
						chunk.setBlock(Block.stone.blockId, x, colY, z);
					}
				}

				if (colWaterY <= 58) {
					chunk.setBlock(Block.dirt.blockId, x, colWaterY, z);
				}
				while (colWaterY <= 58) {
					colWaterY++;
					chunk.setBlock(Block.waterStill.blockId, x, colWaterY, z);
				}

				if (chunk.getBlockId(x, orgColY + 1, z) !== Block.waterStill.blockId && chunk.getBlockId(x, orgColY, z) === Block.grass.blockId && treeRNG() > 0.995) {
					chunk.setBlock(Block.dirt.blockId, x, orgColY, z);
					let tY = orgColY + 1;
					while (tY < orgColY + 5) {
						chunk.setBlock(Block.wood.blockId, x, tY, z);
						tY++;
					}
				}
			}
		}
	}
}