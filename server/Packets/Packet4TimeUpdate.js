/*
	========- Packet4TimeUpdate.js -========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");

class Packet4TimeUpdate extends Packet {
	constructor(time = BigInt(0)) {
		super(0x04);

		this.time = time;
	}

	readPacket() {
		
	}

	writePacket() {
		super.writePacket();

		this.writer.writeLong(this.time);

		return this.toBuffer();
	}
}

module.exports = Packet4TimeUpdate;