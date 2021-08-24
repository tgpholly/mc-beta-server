/*
	======- Packet6SpawnPosition.js -=======
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");

class Packet6SpawnPosition extends Packet {
	constructor(x = 8.5, y = 65.5, z = 8.5) {
		super(0x06);

		this.x = x;
		this.y = y;
		this.z = z;
	}

	writePacket() {
		super.writePacket();

		this.writer.writeInt(this.x);
		this.writer.writeInt(this.y);
		this.writer.writeInt(this.z);

		return this.toBuffer();
	}
}

module.exports = Packet6SpawnPosition;