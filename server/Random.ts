import mulberry32 from "./mulberry32";

export default class Random {
	private readonly mulberry32;

	public constructor(seed:number = Date.now()) {
		this.mulberry32 = mulberry32(seed);
	}

	public nextInt(bound = Number.MAX_SAFE_INTEGER) {
		return Math.floor(this.mulberry32() * bound);
	}

	public nextFloat() {
		return this.mulberry32();
	}
}