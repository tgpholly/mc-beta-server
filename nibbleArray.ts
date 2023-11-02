export class NibbleArray {
	private array:Uint8Array;

	public constructor(size:number|ArrayBuffer|Uint8Array) {
		if (size instanceof ArrayBuffer) {
			this.array = new Uint8Array(size);
		} else if (size instanceof Uint8Array) {
			this.array = new Uint8Array(size);
		} else {
			this.array = new Uint8Array(size >> 1);
		}
	}

	public get(index:number) {
		const arrayIndex = index >> 1;
		if ((index & 1) === 0) {
			return this.array[arrayIndex] & 0xf;
		} else {
			return this.array[arrayIndex] >> 4 & 0xf;
		}
	}

	public set(index:number, value:number) {
		const arrayIndex = index >> 1;
		if ((index & 1) === 0) {
			this.array[arrayIndex] = this.array[arrayIndex] & 0xf0 | value & 0xf;
		} else {
			this.array[arrayIndex] = this.array[arrayIndex] & 0xf | (value & 0xf) << 4;
		}
	}

	public toBuffer() {
		return Buffer.from(this.array);
	}
}