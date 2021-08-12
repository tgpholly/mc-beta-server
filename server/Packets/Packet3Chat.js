const Packet = require("./Packet.js");

class Packet3Chat extends Packet {
	constructor(message = "") {
		super(0x03);

		this.message = message;
	}

	writePacket() {
		super.writePacket();

		this.writer.writeString(this.message);

		return this.toBuffer();
	}
}

module.exports = Packet3Chat;