const Packet = require("./Packet.js");

class Packet10Player extends Packet {
	constructor(onGround = true) {
		super(0x0A);

		this.onGround = onGround;
	}

	writePacket() {
		super.writePacket();

		this.writer.writeBool(this.onGround);

		return this.toBuffer();
	}
}

module.exports = Packet10Player;