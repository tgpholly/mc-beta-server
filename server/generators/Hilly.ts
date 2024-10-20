import { Block } from "../blocks/Block";
import { Chunk } from "../Chunk";
import { IGenerator } from "./IGenerator";
import { Noise2D, makeNoise2D } from "../../external/OpenSimplex2D";
import { Noise3D, makeNoise3D } from "../../external/OpenSimplex3D";
import { QueuedBlockUpdate } from "../queuedUpdateTypes/BlockUpdate";
import mulberry32 from "../mulberry32";

export class HillyGenerator implements IGenerator {
	private seed:number;
	seedGenerator:() => number;

	private generator:Noise2D;
	private generator1:Noise2D;
	private generator2:Noise2D;
	private generator3:Noise2D;
	private generator4:Noise2D;
	private generator5:Noise2D;
	private generator6:Noise2D;
	private oceanGenerator:Noise2D;
	private hillGenerator:Noise2D;

	private caveGenerator1:Noise3D;
	private caveGenerator2:Noise3D;
	private caveGenerator3:Noise3D;
	private caveGenerator4:Noise3D;

	private underwaterGravelGenerator:Noise2D;
	private underwaterSandGenerator:Noise2D;
	private underwaterClayGenerator:Noise2D;
	private flowerGenerator:Noise2D;

	public constructor(seed:number) {
		this.seed = seed;
		this.seedGenerator = mulberry32(this.seed);

		this.generator = this.createGenerator2D();
		this.generator1 = this.createGenerator2D();
		this.generator2 = this.createGenerator2D();
		this.generator3 = this.createGenerator2D();
		this.generator4 = this.createGenerator2D();
		this.generator5 = this.createGenerator2D();
		this.generator6 = this.createGenerator2D();
		this.oceanGenerator = this.createGenerator2D();
		this.hillGenerator = this.createGenerator2D();

		this.caveGenerator1 = this.createGenerator3D();
		this.caveGenerator2 = this.createGenerator3D();
		this.caveGenerator3 = this.createGenerator3D();
		this.caveGenerator4 = this.createGenerator3D();

		this.underwaterGravelGenerator = this.createGenerator2D();
		this.underwaterSandGenerator = this.createGenerator2D();
		this.underwaterClayGenerator = this.createGenerator2D();
		this.flowerGenerator = this.createGenerator2D();
	}

	private createGenerator2D() {
		return makeNoise2D(this.seedGenerator() * Number.MAX_SAFE_INTEGER);
	}

	private createGenerator3D() {
		return makeNoise3D(this.seedGenerator() * Number.MAX_SAFE_INTEGER);
	}

	public generate(chunk:Chunk) {
		const treeRNG = mulberry32(this.seed + chunk.x + chunk.z);
		const sugarcaneRNG = mulberry32(this.seed + chunk.x + chunk.z);
		const grassRNG = mulberry32(this.seed + chunk.x + chunk.z);
		const flowerRNG = mulberry32(this.seed + chunk.x + chunk.z);

		let colY = 0, colDirtMin = 0, colWaterY = 0, orgColY = 0;
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				const oceanValue = this.oceanGenerator((chunk.x * 16 + x) / 128, (chunk.z * 16 + z) / 128) * 100;
				orgColY = colWaterY = colY = 60 + Math.round((
					this.generator((chunk.x * 16 + x) / 16, (chunk.z * 16 + z) / 16) * 16 +
					this.generator1((chunk.z * 16 + z) / 16, (chunk.x * 16 + x) / 16) * 16 +
					this.generator2((chunk.x * 16 + x) / 8, (chunk.z * 16 + z) / 8) * 8 +
					this.generator3((chunk.z * 16 + z) / 4, (chunk.x * 16 + x) / 4) * 4 +
					this.generator4((chunk.x * 16 + x) / 4, (chunk.z * 16 + z) / 4) * 4 +
					this.generator5((chunk.z * 16 + z) / 10, (chunk.x * 16 + x) / 10) * 10 +
					this.generator6((chunk.x * 16 + x) / 16, (chunk.z * 16 + z) / 16) * 16 +
					oceanValue +
					(Math.max(this.hillGenerator((chunk.x * 16 + x) / 128, (chunk.z * 16 + z) / 128), 0) * 50 + Math.min(oceanValue, 0))
				) / 9);
				colDirtMin = colY - 2;
				const sandNoise = this.underwaterSandGenerator((chunk.x * 16 + x) / 16, (chunk.z * 16 + z) / 16);
				if (colY <= 60 && sandNoise > 0.5) {
					chunk.setBlock(Block.sand.blockId, x, colY, z);
				} else {
					chunk.setBlock(Block.grass.blockId, x, colY, z);
				}

				let caveY = colY + 1;
				while (colY-- > 0) {
					if (colY >= colDirtMin) {
						chunk.setBlock(Block.dirt.blockId, x, colY, z);
					} else if (colY === 0) {
						chunk.setBlock(Block.bedrock.blockId, x, colY, z);
					} else {
						chunk.setBlock(Block.stone.blockId, x, colY, z);
					}
				}

				// Generate underwater blocks
				if (colWaterY <= 58) {
					if (this.underwaterGravelGenerator((chunk.x * 16 + x) / 16, (chunk.z * 16 + z) / 16) > 0.3) {
						chunk.setBlock(Block.gravel.blockId, x, colWaterY, z);
					} else if (sandNoise > 0.4) {
						chunk.setBlock(Block.sand.blockId, x, colWaterY, z);
					} else if (this.underwaterClayGenerator((chunk.x * 16 + x) / 16, (chunk.z * 16 + z) / 16) > 0.5) {
						chunk.setBlock(Block.clay.blockId, x, colWaterY, z);
					} else {
						chunk.setBlock(Block.dirt.blockId, x, colWaterY, z);
					}
				}
				while (colWaterY <= 58) {
					colWaterY++;
					chunk.setBlock(Block.waterStill.blockId, x, colWaterY, z);
				}


				while (caveY-- > 1) {
					if (
						((this.caveGenerator1((chunk.x * 16 + x) / 16, caveY / 16, (chunk.z * 16 + z) / 16) +
						this.caveGenerator2((chunk.x * 16 + x) / 8, caveY / 8, (chunk.z * 16 + z) / 8)) / 2) > 0.45
						|| this.caveGenerator3((chunk.x * 16 + x) / 16, caveY / 16, (chunk.z * 16 + z) / 16) > 0.6 ||
						this.caveGenerator4((chunk.x * 16 + x) / 8, caveY / 8, (chunk.z * 16 + z) / 8) > 0.6
					) {
						if (caveY <= 3) {
							chunk.setBlock(Block.lavaStill.blockId, x, caveY, z);
						} else {
							chunk.setBlock(0, x, caveY, z);
						}
					}
				}

				const queuedChunkBlocks = chunk.world.queuedChunkBlocks;
				if (queuedChunkBlocks.length > 0) {
					const thisCoordPair = Chunk.CreateCoordPair(chunk.x, chunk.z);
					for (let i = queuedChunkBlocks.length - 1; i >= 0; i--) {
						const blockUpdate = queuedChunkBlocks[i];
						if (blockUpdate instanceof QueuedBlockUpdate && blockUpdate.coordPair === thisCoordPair) {
							queuedChunkBlocks.splice(i, 1);
							chunk.setBlockWithMetadata(blockUpdate.blockId, blockUpdate.metadata, blockUpdate.x, blockUpdate.y, blockUpdate.z);
						}
					}
				}

				// Grass and flowers
				if (chunk.getBlockId(x, orgColY, z) === Block.grass.blockId) {
					if (grassRNG() > 0.9) {
						chunk.setBlockWithMetadata(Block.tallGrass.blockId, 1, x, orgColY + 1, z);
					} else if (this.flowerGenerator((chunk.x * 16 + x) / 16, (chunk.z * 16 + z) / 16) > 0.5 && flowerRNG() > 0.9) {
						if (flowerRNG() > 0.4) {
							chunk.setBlockWithMetadata(Block.flowerRose.blockId, 1, x, orgColY + 1, z);
						} else {
							chunk.setBlockWithMetadata(Block.flowerDandelion.blockId, 1, x, orgColY + 1, z);
						}
					}
				}
				
				if (
					sugarcaneRNG() > 0.992 &&
					chunk.getBlockId(x, orgColY + 1, z) !== Block.waterStill.blockId &&
					chunk.getBlockId(x, orgColY, z) === Block.grass.blockId &&
					(((x - 1) < 0 ? false : chunk.getBlockId(x - 1, orgColY, z) === Block.waterStill.blockId) || 
					((x + 1) > 15 ? false : chunk.getBlockId(x + 1, orgColY, z) === Block.waterStill.blockId) || 
					((z - 1) < 0 ? false : chunk.getBlockId(x, orgColY, z - 1) === Block.waterStill.blockId) || 
					((z + 1) > 15 ? false : chunk.getBlockId(x, orgColY, z + 1) === Block.waterStill.blockId))
				) {
					let sugarcaneYHeight = 2 + Math.round(sugarcaneRNG() * 2.5);
					while (sugarcaneYHeight > 0) {
						chunk.setBlock(Block.sugarcane.blockId, x, orgColY + sugarcaneYHeight, z);
						sugarcaneYHeight--;
					}
				}

				// TODO: Move trees to it's own generator
				if (chunk.getBlockId(x, orgColY + 1, z) !== Block.waterStill.blockId && chunk.getBlockId(x, orgColY, z) === Block.grass.blockId && treeRNG() > 0.995) {
					const treeType = treeRNG() >= 0.5;
					chunk.setBlock(Block.dirt.blockId, x, orgColY, z);
					let tYT = 0, tY = tYT = orgColY + 4 + Math.round(treeRNG() - 0.2), tLY = 0;
					while (tY > orgColY) {
						chunk.setBlockWithMetadata(Block.wood.blockId, treeType ? 2 : 0, x, tY, z);
						if (tLY !== 0 && tLY < 3) {
							for (let tX = -2; tX <= 2; tX++) {
								for (let tZ = -2; tZ <= 2; tZ++) {
									if (tX === 0 && tZ === 0) {
										continue;
									}
									chunk.setBlockWithMetadata(Block.leaves.blockId, treeType ? 2 : 0, x + tX, tY, z + tZ);
								}	
							}
						}
						tY--;
						tLY++;
					}
					tY = 0;
					while (tY < 2) {
						for (let tX = -1; tX < 2; tX++) {
							for (let tZ = -1; tZ < 2; tZ++) {
								if (tX === 0 && tZ === 0 && tY !== 1) {
									continue;
								}
								chunk.setBlockWithMetadata(Block.leaves.blockId, treeType ? 2 : 0, x + tX, tYT + tY, z + tZ);
							}	
						}
						tY++;
					}
				}
			}
		}
	}
}