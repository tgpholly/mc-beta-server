
import { makeNoise2D, Noise2D } from "../../external/OpenSimplex2D";
import { makeNoise3D, Noise3D } from "../../external/OpenSimplex3D";
import { Block } from "../blocks/Block";
import { Chunk } from "../Chunk";
import mulberry32 from "../mulberry32";
import { IGenerator } from "./IGenerator";

export class NewOverworld implements IGenerator {
	private seed:number;
	seedGenerator:() => number;

	public layer1:Noise3D;
	public layer2:Noise3D;
	public mix:Noise3D;
	public maxHeight:Noise2D;

	private createGenerator2D() {
		return makeNoise2D(this.seedGenerator() * Number.MAX_SAFE_INTEGER);
	}

	private createGenerator3D() {
		return makeNoise3D(this.seedGenerator() * Number.MAX_SAFE_INTEGER);
	}

	public constructor(seed:number) {
		this.seed = seed;
		this.seedGenerator = mulberry32(this.seed);
		this.layer1 = this.createGenerator3D();
		this.layer2 = this.createGenerator3D();
		this.mix = this.createGenerator3D();
		this.maxHeight = this.createGenerator2D();
	}

	private noiseForCoord(chunk:Chunk, x:number, y:number, z:number) {
		const mixValue = this.mix((chunk.x * 16 + x) / 16, y / 16, (chunk.z * 16 + z) / 16);
		const layer1 = this.layer1((chunk.x * 16 + x) / 64, y / 64, (chunk.z * 16 + z) / 64) / 2048;
		const layer2 = this.layer2((chunk.x * 16 + x) / 64, y / 64, (chunk.z * 16 + z) / 64) / 2048;
		const maxHeightLayer = 80 + this.maxHeight((chunk.x * 16 + x) / 64, (chunk.z * 16 + z) / 64) * 32;
		if (y > maxHeightLayer) {
			return 0;
		}
		
		if (mixValue < 0) {
			return layer1;
		} else if (mixValue > 1) {
			return layer2;
		} else {
			return layer1 + (layer2 - layer1) * mixValue;
		}
	}

	public generate(chunk:Chunk) {
		for (let y = 0; y < 128; y++) {
			for (let x = 0; x < 16; x++) {
				for (let z = 0; z < 16; z++) {
					if (y === 0 || (y < 3 && this.layer1(x, y, z) > 0.1)) {
						chunk.setBlock(Block.bedrock.blockId, x, y, z);
					} else {
						
						if (this.noiseForCoord(chunk, x, y, z) > 0) {
							chunk.setBlock(Block.stone.blockId, x, y, z);
						} else if (y < 64) {
							chunk.setBlock(Block.waterStill.blockId, x, y, z);
						}
					}
				}
			}	
		}

		for (let y = 0; y < 128; y++) {
			for (let x = 0; x < 16; x++) {
				for (let z = 0; z < 16; z++) {
					if (y === 0 || (y < 3 && this.layer1(x, y, z) > 0.1)) {
						chunk.setBlock(Block.bedrock.blockId, x, y, z);
					} else {
						
					}
				}
			}	
		}
	}
}