const Packet = require("./Packet.js");

class Packet2Handshake extends Packet {
	constructor(username = "") {
		super(0x02);

		this.username = username;
	}

	writePacket(EID = 0) {
		super.writePacket();

		this.writer.writeString("-"); // "-" == Offline mode

		return this.toBuffer();
	}
}

module.exports = Packet2Handshake;