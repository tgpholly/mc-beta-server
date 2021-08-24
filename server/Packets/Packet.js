/*
	==============- Packet.js -=============
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const bufferStuff = require("../bufferStuff.js");

module.exports = class {
	constructor(packetID = 0x00) {
		this.id = packetID;

		this.packetSize = 0;

		this.writer = null;
	}

	writePacket() {
		this.writer = new bufferStuff.Writer(this.packetSize);

		this.writer.writeByte(this.id);

		return this.writer;
	}

	toBuffer() {
		return this.writer == null ? Buffer.alloc(0) : this.writer.buffer;
	}
}