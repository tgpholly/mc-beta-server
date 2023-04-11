export class NibbleArray {
	private array:Uint8Array;

	public constructor(size:number|ArrayBuffer|Uint8Array) {
		if (size instanceof ArrayBuffer) {
			this.array = new Uint8Array(size);
		} else if (size instanceof Uint8Array) {
			this.array = new Uint8Array(size);
		} else {
			this.array = new Uint8Array(Math.round(size / 2));
		}
	}

	// We can determine which side of the byte to read
	// from if the halved index has a remainder.
	private isLowOrHighNibble(index:number) {
		return index % 1 !== 0;
	}

	public get(index:number) {
		index = index / 2;

		const arrayIndex = index | 0;
		if (this.isLowOrHighNibble(index)) {
			return this.array[arrayIndex] >> 4;
		} else {
			return this.array[arrayIndex] & 0x0f;
		}
	}

	public set(index:number, value:number) {
		index = index / 2;

		const arrayIndex = index | 0;
		if (this.isLowOrHighNibble(index)) {
			this.array[arrayIndex] = value << 4 | this.array[arrayIndex] & 0xf;
		} else {
			this.array[arrayIndex] = this.array[arrayIndex] & 0xf0 | value;
		}
	}

	public toBuffer() {
		return Buffer.from(this.array);
	}
}