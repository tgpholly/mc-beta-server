/*
	=========- Packet2Handshake.js -========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");

class Packet2Handshake extends Packet {
	constructor(username = "") {
		super(0x02);

		this.username = username;
	}

	writePacket() {
		super.writePacket();

		this.writer.writeString("-"); // "-" == Offline mode

		return this.toBuffer();
	}
}

module.exports = Packet2Handshake;