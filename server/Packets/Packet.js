const bufferStuff = require("../bufferStuff.js");

module.exports = class {
	constructor(packetID = 0x00) {
		this.id = packetID;

		this.writer = null;
	}

	writePacket() {
		this.writer = new bufferStuff.Writer();

		this.writer.writeByte(this.id);

		return this.writer;
	}

	toBuffer() {
		return this.writer == null ? Buffer.alloc(0) : this.writer.buffer;
	}
}