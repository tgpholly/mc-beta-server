module.exports.Writer = class {
	constructor() {
		this.buffer = Buffer.alloc(0);
	}

	reset() {
		this.buffer = Buffer.alloc(0);
	}

	writeBuffer(buff = Buffer.alloc(0)) {
		this.buffer = Buffer.concat([this.buffer, buff], this.buffer.length + buff.length);
	}

	writeBool(data = false) {
		this.writeByte(data ? 1 : 0);
	}

	writeByte(data = 0) {
		const buff = Buffer.alloc(1);
		buff.writeInt8(data, 0);

		this.writeBuffer(buff);
	}

	writeShort(data = 0) {
		const buff = Buffer.alloc(2);
		buff.writeIntBE(data, 0, 2);

		this.writeBuffer(buff);
	}

	writeInt(data = 0) {
		const buff = Buffer.alloc(4);
		buff.writeIntBE(data, 0, 4);

		this.writeBuffer(buff);
	}

	writeLong(data = 0) {
		const buff = Buffer.alloc(8);
		buff.writeBigInt64BE(BigInt(data), 0);

		this.writeBuffer(buff);
	}

	writeFloat(data = 0.0) {
		const buff = Buffer.alloc(4);
		buff.writeFloatBE(data, 0);

		this.writeBuffer(buff);
	}

	writeDouble(data = 0.0) {
		const buff = Buffer.alloc(8);
		buff.writeDoubleBE(data, 0);

		this.writeBuffer(buff);
	}

	writeString(string = "") {
		this.writeShort(string.length);

		for (let i = 0; i < string.length; i++) {
			this.writeShort(string.charCodeAt(i));
		}
	}
}

module.exports.Reader = class {
	constructor(buffer = Buffer.alloc(0)) {
		this.buffer = buffer;
		this.offset = 0;
	}

	readBool() {
		return this.readByte() == 0x01 ? true : false;
	}

	readByte() {
		const data = this.buffer.readInt8(this.offset);
		this.offset += 1;
		return data;
	}

	readShort() {
		const data = this.buffer.readIntBE(this.offset, 2);
		this.offset += 2;
		return data;
	}

	readInt() {
		const data = this.buffer.readIntBE(this.offset, 4);
		this.offset += 4;
		return data;
	}

	readLong() {
		const data = this.buffer.readBigInt64BE(this.offset);
		this.offset += 8;
		return data;
	}

	readFloat() {
		const data = this.buffer.readFloatBE(this.offset);
		this.offset += 4;
		return data;
	}

	readDouble() {
		const data = this.buffer.readDoubleBE(this.offset);
		this.offset += 8;
		return data;
	}

	readString() {
		const length = this.readShort();
		let data = "";

		for (let i = 0; i < length; i++) {
			data += String.fromCharCode(this.readShort());
		}

		return data;
	}
}