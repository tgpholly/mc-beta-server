/*
	========- Packet18Animation.js -========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");

class Packet18Animation extends Packet {
	constructor(EID = 0, animation = 0) {
		super(0x12);

		this.EID = EID;
		this.animation = animation;
	}

	writePacket() {
		super.writePacket();

		this.writer.writeInt(this.EID);
		this.writer.writeByte(this.animation);

		return this.toBuffer();
	}
}

module.exports = Packet18Animation;