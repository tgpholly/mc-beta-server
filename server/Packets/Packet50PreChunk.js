const Packet = require("./Packet.js");

class Packet50PreChunk extends Packet {
	constructor(x = 0, z = 0, mode = true) {
		super(0x32);

		this.x = x;
		this.z = z;
		this.mode = mode;
	}

	writePacket() {
		super.writePacket();

		this.writer.writeInt(this.x);
		this.writer.writeInt(this.z);
		this.writer.writeBool(this.mode);

		return this.toBuffer();
	}
}

module.exports = Packet50PreChunk;