/*
	=======- Packet53BlockChange.js -=======
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");

class Packet53BlockChange extends Packet {
	constructor(x = 0, y = 0, z = 0, block_type = 0, block_metadata = 0) {
		super(0x35);

		this.x = x;
		this.y = y;
		this.z = z;
		this.block_type = block_type;
		this.block_metadata = block_metadata;
	}

	writePacket() {
		super.writePacket();

		this.writer.writeInt(this.x);
		this.writer.writeByte(this.y);
		this.writer.writeInt(this.z);
		this.writer.writeByte(this.block_type);
		this.writer.writeByte(this.block_metadata);

		return this.toBuffer();
	}
}

module.exports = Packet53BlockChange;