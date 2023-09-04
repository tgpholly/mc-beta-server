import { Block } from "../blocks/Block";
import { Chunk } from "../Chunk";
import { IGenerator } from "./IGenerator";
import { Noise2D, makeNoise2D } from "../../external/OpenSimplex2D";
import { Noise3D, makeNoise3D } from "../../external/OpenSimplex3D";
import { QueuedBlockUpdate } from "../queuedUpdateTypes/BlockUpdate";
import mulberry32 from "../mulberry32";

export class NetherGenerator implements IGenerator {
	private seed:number;
	seedGenerator:() => number;

	private generator:Noise3D;
	private generator1:Noise3D;
	private generator2:Noise3D;
	private generator3:Noise3D;
	private generator4:Noise3D;
	private generator5:Noise3D;

	public constructor(seed:number) {
		this.seed = seed;
		this.seedGenerator = mulberry32(this.seed);

		this.generator = this.createGenerator3D();
		this.generator1 = this.createGenerator3D();
		this.generator2 = this.createGenerator3D();
		this.generator3 = this.createGenerator3D();
		this.generator4 = this.createGenerator3D();
		this.generator5 = this.createGenerator3D();
	}

	private createGenerator2D() {
		return makeNoise2D(this.seedGenerator() * Number.MAX_SAFE_INTEGER);
	}

	private createGenerator3D() {
		return makeNoise3D(this.seedGenerator() * Number.MAX_SAFE_INTEGER);
	}

	public generate(chunk:Chunk) {
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				for (let y = 0; y < 128; y++) {
					if (y === 0) {
						chunk.setBlock(Block.bedrock.blockId, x, y, z);
						continue;
					}

					const layer1 = (this.generator((chunk.x * 16 + x) / 32, y / 32, (chunk.z * 16 + z) / 32) + this.generator1((chunk.x * 16 + x) / 32, y / 32, (chunk.z * 16 + z) / 32)) / 2;
					const layer2 = (this.generator2((chunk.x * 16 + x) / 128, y / 128, (chunk.z * 16 + z) / 128) + this.generator3((chunk.x * 16 + x) / 128, y / 128, (chunk.z * 16 + z) / 128)) / 2;
					const layer3 = (this.generator4((chunk.x * 16 + x) / 16, y / 16, (chunk.z * 16 + z) / 16) + this.generator5((chunk.x * 16 + x) / 16, y / 16, (chunk.z * 16 + z) / 16)) / 2;
					if ((layer1 + layer2 + layer3) / 3 >= 0.1) {
						chunk.setBlock(Block.netherrack.blockId, x, y, z);
					} else if (y < 10) {
						chunk.setBlock(Block.lavaStill.blockId, x, y, z);
					}
				}
			}
		}
	}
}