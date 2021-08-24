const Packet = require("./Packet.js");
const Converter = require("../Converter.js");

class Packet32EntityLook extends Packet {
	constructor(EID = 0, yaw = 0, pitch = 0) {
		super(0x20);

		this.packetSize = 7;

		this.EID = EID;
		this.packedYaw = Converter.to360Fraction(yaw);
		this.packedPitch = Converter.to360Fraction(pitch);
	}

	writePacket() {
		super.writePacket();

		this.writer.writeInt(this.EID);
		this.writer.writeUByte(this.packedYaw);
		this.writer.writeUByte(this.packedPitch);

		return this.toBuffer();
	}
}

module.exports = Packet32EntityLook;