/*
	======- Packet34EntityTeleport.js -=====
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");
const Converter = require("../Converter.js");

class Packet34EntityTeleport extends Packet {
	constructor(EID = 0, x = 0, y = 0, z = 0, yaw = 0, pitch = 0) {
		super(0x22);

		this.packetSize = 19;

		this.EID = EID;
		this.absX = Converter.toAbsoluteInt(x);
		this.absY = Converter.toAbsoluteInt(y);
		this.absZ = Converter.toAbsoluteInt(z);
		this.packedYaw = Converter.to360Fraction(yaw);
		this.packedPitch = Converter.to360Fraction(pitch);
	}

	soup() {
		super.writePacket();
		this.writer.writeInt(this.EID);
	}

	writePacket() {
		this.writer.writeInt(this.absX);
		this.writer.writeInt(this.absY);
		this.writer.writeInt(this.absZ);
		this.writer.writeUByte(this.packedYaw);
		this.writer.writeUByte(this.packedPitch);

		return this.toBuffer();
	}
}

module.exports = Packet34EntityTeleport;