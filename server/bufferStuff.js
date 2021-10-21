/*
	===========- bufferStuff.js -===========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

module.exports.Writer = class {
	// bufferStuff supports pre-allocating memory for the buffer
	// if you pass in a size of 0 then it will just dynamicly allocate at the
	// cost of performance

	// NOTE: In pre-allocation mode if you exceed the size of the buffer
	// 		 that you set it will cause a crash.
	constructor(size = 0) {
		this.buffer = Buffer.alloc(size);
		this.offset = 0;
		this.baseSize = size;
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

	// NOTE: Currently writing a nibble requires you to write both halves at the same time.
	writeNibble(nibble1 = 0, nibble2 = 0) {
		this.writeUByte(nibble1 | (nibble2 << 4));
	}

	writeByte(data = 0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(1);
			buff.writeInt8(data, 0);
	
			this.writeBuffer(buff);
		} else {
			this.buffer.writeInt8(data, this.offset);
			this.offset += 1;
		}
	}

	writeUByte(data = 0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(1);
			buff.writeUInt8(data, 0);

			this.writeBuffer(buff);
		} else {
			this.buffer.writeUInt8(data, this.offset);
			this.offset += 1;
		}
	}

	writeByteArray(data = [0]) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(data.length);

			for (let byte of data) {
				buff.writeInt8(byte);
			}

			this.writeBuffer(buff);
		} else {
			for (let byte of data) {
				this.buffer.writeInt8(byte);
				this.offset += 1;
			}
		}
	}

	writeShort(data = 0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(2);
			buff.writeIntBE(data, 0, 2);

			this.writeBuffer(buff);
		} else {
			this.buffer.writeIntBE(data, this.offset, 2);
			this.offset += 2;
		}
	}

	writeShortArray(data = [0]) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(data.length * 2);
			let offset = 0;

			for (let short of data) {
				buff.writeIntBE(short, offset, 2);
				offset += 2;
			}

			this.writeBuffer(buff);
		} else {
			for (let short of data) {
				this.buffer.writeIntBE(short, this.offset, 2);
				this.offset += 2;
			}
		}
	}

	writeInt(data = 0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(4);
			buff.writeIntBE(data, 0, 4);

			this.writeBuffer(buff);
		} else {
			this.buffer.writeIntBE(data, this.offset, 4);
			this.offset += 4;
		}
	}

	writeLong(data = 0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(8);
			if (data instanceof BigInt) buff.writeBigInt64BE(data, 0);
			else buff.writeBigInt64BE(BigInt(data), 0);

			this.writeBuffer(buff);
		} else {
			if (data instanceof BigInt) this.buffer.writeBigInt64BE(data, this.offset);
			else this.buffer.writeBigInt64BE(BigInt(data), this.offset);
			this.offset += 8;
		}
	}

	writeFloat(data = 0.0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(4);
			buff.writeFloatBE(data, 0);

			this.writeBuffer(buff);
		} else {
			this.buffer.writeFloatBE(data, this.offset);
			this.offset += 4;
		}
	}

	writeDouble(data = 0.0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(8);
			buff.writeDoubleBE(data, 0);

			this.writeBuffer(buff);
		} else {
			this.buffer.writeDoubleBE(data, this.offset);
			this.offset += 8;
		}
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