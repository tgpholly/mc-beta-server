import { Block } from "../blocks/Block";
import { Chunk } from "../Chunk";
import { IGenerator } from "./IGenerator";

export class FlatGenerator implements IGenerator {
	public generate(chunk:Chunk) {
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				for (let y = 0; y < 128; y++) {
					if (y === 63) {
						chunk.setBlock(Block.grass.blockId, x, y, z);
					} else if (y === 62 || y === 61) {
						chunk.setBlock(Block.dirt.blockId, x, y, z);
					} else if (y === 0) {
						chunk.setBlock(Block.bedrock.blockId, x, y, z);
					} else if (y < 61) {
						chunk.setBlock(Block.stone.blockId, x, y, z);
					}
				}
			}	
		}
	}
}