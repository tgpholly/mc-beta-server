/*
	=======- Packet1LoginRequest.js -=======
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");

class Packet1LoginRequest extends Packet {
	constructor(protocol_version = 0, username = "", map_seed = BigInt(0), dimension = 0) {
		super(0x01);

		this.protocol_version = protocol_version;
		this.username = username;
		this.map_seed = map_seed;
		this.dimension = dimension;
	}

	readPacket() {
		
	}

	writePacket(EID = 0) {
		super.writePacket();

		this.writer.writeInt(EID);
		this.writer.writeString("");
		this.writer.writeLong(971768181197178410);
		this.writer.writeByte(0);

		return this.toBuffer();
	}
}

module.exports = Packet1LoginRequest;