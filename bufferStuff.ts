export class Reader {
	private buffer:Buffer;
	private offset:number;

	public constructor(buffer:Buffer) {
		this.buffer = buffer;
		this.offset = 0;
	}

	public readBuffer(bytes:number) {
		const value = this.buffer.subarray(this.offset, this.offset + bytes);
		this.offset += bytes;
		return value;
	}

	public readUint8Array(bytes:number) {
		const croppedBuffer = this.readBuffer(bytes);
		const newArray = new Uint8Array(croppedBuffer.length);
		for (let i = 0; i < croppedBuffer.length; i++) {
			newArray[i] = croppedBuffer[i];
		}
		return newArray;
	}

	public readByte() {
		const value = this.buffer.readInt8(this.offset);
		this.offset++;
		return value;
	}

	public readUByte() {
		const value = this.buffer.readUInt8(this.offset);
		this.offset++;
		return value;
	}

	public readBool() {
		return Boolean(this.readUByte());
	}

	public readShort() {
		const value = this.buffer.readInt16BE(this.offset);
		this.offset += 2
		return value;
	}

	public readInt() {
		const value = this.buffer.readInt32BE(this.offset);
		this.offset += 4;
		return value;
	}

	public readLong() {
		const value = this.buffer.readBigInt64BE(this.offset);
		this.offset += 8;
		return value;
	}

	public readFloat() {
		const value = this.buffer.readFloatBE(this.offset);
		this.offset += 4;
		return value;
	}

	public readDouble() {
		const value = this.buffer.readDoubleBE(this.offset);
		this.offset += 8;
		return value;
	}

	public readString() {
		const length = this.readShort();
		let text:string = "";

		for (let i = 0; i < length; i++) {
			text += String.fromCharCode(this.readShort());
		}

		return text;
	}
}

export class Writer {
	private buffer:Buffer;
	private offset:number;
	private resizable:boolean;

	public constructor(size:number = 0) {
		this.buffer = Buffer.alloc(size);
		this.offset = 0;
		this.resizable = size === 0;
	}

	public toBuffer() {
		return this.buffer;
	}

	public toString() {
		return this.buffer.toString();
	}

	public writeBuffer(buffer:Buffer) {
		this.buffer = Buffer.concat([this.buffer, buffer], this.buffer.length + buffer.length);

		return this;
	}

	public writeByte(value:number) {
		if (this.resizable) {
			const buffer = Buffer.alloc(1);
			buffer.writeInt8(value);
			this.writeBuffer(buffer);
		} else {
			this.buffer.writeInt8(value, this.offset);
			this.offset++;
		}

		return this;
	}

	public writeUByte(value:number) {
		if (this.resizable) {
			const buffer = Buffer.alloc(1);
			buffer.writeUInt8(value);
			this.writeBuffer(buffer);
		} else {
			this.buffer.writeUInt8(value, this.offset);
			this.offset++;
		}

		return this;
	}
	
	public writeBool(value:boolean|number) {
		if (typeof(value) === "number") {
			value = Boolean(value);
		}
		this.writeUByte(value ? 1 : 0);

		return this;
	}

	public writeShort(value:number) {
		if (this.resizable) {
			const buffer = Buffer.alloc(2);
			buffer.writeInt16BE(value);
			this.writeBuffer(buffer);
		} else {
			this.buffer.writeInt16BE(value, this.offset);
			this.offset += 2;
		}

		return this;
	}

	public writeInt(value:number) {
		if (this.resizable) {
			const buffer = Buffer.alloc(4);
			buffer.writeInt32BE(value);
			this.writeBuffer(buffer);
		} else {
			this.buffer.writeInt32BE(value, this.offset);
			this.offset += 4;
		}

		return this;
	}

	public writeLong(value:number|bigint) {
		if (typeof(value) !== "bigint") {
			value = BigInt(value);
		}

		if (this.resizable) {
			const buffer = Buffer.alloc(8);
			buffer.writeBigInt64BE(value);
			this.writeBuffer(buffer);
		} else {
			this.buffer.writeBigInt64BE(value, this.offset);
			this.offset += 8;
		}

		return this;
	}

	public writeFloat(value:number) {
		if (this.resizable) {
			const buffer = Buffer.alloc(4);
			buffer.writeFloatBE(value);
			this.writeBuffer(buffer);
		} else {
			this.buffer.writeFloatBE(value, this.offset);
			this.offset += 4;
		}

		return this;
	}

	public writeDouble(value:number) {
		if (this.resizable) {
			const buffer = Buffer.alloc(8);
			buffer.writeDoubleBE(value);
			this.writeBuffer(buffer);
		} else {
			this.buffer.writeDoubleBE(value, this.offset);
			this.offset += 8;
		}

		return this;
	}

	public writeString(text:string) {
		this.writeShort(text.length);

		for (let i = 0; i < text.length; i++) {
			this.writeShort(text.charCodeAt(i));
		}

		return this;
	}
}