
import { makeNoise2D, Noise2D } from "../../../external/OpenSimplex2D";
import { makeNoise3D, Noise3D } from "../../../external/OpenSimplex3D";
import Block from "../../blocks/Block";
import Chunk from "../../Chunk";
import IGenerator from "../IGenerator";
import mulberry32 from "../../mulberry32";
import MathUtil from "../../MathUtil";
import Spline from "typescript-cubic-spline";

const INFLUENCE_SCALE = 128;
const INFLUENCE_SPLINE_POINTS: [number[], number[]] = [
	[ -1, -0.5, -0.42, -0.16, -0.14, -0.13, 0,   0.25, 1 ],
	[ 50, 50,   75,    75,    103,   103,   105, 110,  110 ]
];
const INFLUENCE_SPLINE = new Spline(INFLUENCE_SPLINE_POINTS[0], INFLUENCE_SPLINE_POINTS[1]);

const EROSION_SCALE = 256;
const EROSION_SPLINE_POINTS: readonly [number, number][] = [
	[-1, 0],
	[0.3, 0.1],
	[0.4, 0.2],
	[0.9, 0.3],
	[1.0, 0.4]
];

export default class ExperimentalGenerator implements IGenerator {
	private seed:number;
	seedGenerator:() => number;

	public influenceGenerator:Noise2D;
	public errosionGenerator:Noise2D;

	private createGenerator2D() {
		return makeNoise2D(this.seedGenerator() * Number.MAX_SAFE_INTEGER);
	}

	private createGenerator3D() {
		return makeNoise3D(this.seedGenerator() * Number.MAX_SAFE_INTEGER);
	}

	public constructor(seed:number) {
		this.seed = seed;
		this.seedGenerator = mulberry32(this.seed);
		this.influenceGenerator = this.createGenerator2D();
		this.errosionGenerator = this.createGenerator2D();
	}

	public getInfluence(x:number, z:number) {
		const influence = this.influenceGenerator(x / INFLUENCE_SCALE, z / INFLUENCE_SCALE);
		console.log(influence, INFLUENCE_SPLINE.at(influence));
	}

	public generate(chunk:Chunk) {
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				const influence = this.influenceGenerator((chunk.x * 16 + x) / INFLUENCE_SCALE, (chunk.z * 16 + z) / INFLUENCE_SCALE);
				const heightMappedInfluence = INFLUENCE_SPLINE.at(influence);
				const erosion = this.errosionGenerator((chunk.x * 16 + x) / EROSION_SCALE, (chunk.z * 16 + z) / EROSION_SCALE);
				const erosionMappedInfluence = MathUtil.Interpolate(EROSION_SPLINE_POINTS, erosion);

				chunk.setBlock(Block.stone.blockId, x, Math.round(heightMappedInfluence), z);
			}
		}

		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				let blockFound = false;
				for (let y = 127; y > 0; y--) {
					if (!blockFound && chunk.getBlockId(x, y, z) === Block.stone.blockId) {
						blockFound = true;
					}
					if (blockFound) {
						chunk.setBlock(Block.stone.blockId, x, y, z);
					}
				}
			}
		}
	}
}