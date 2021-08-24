/*
	==- Packet13PlayerPositionAndLook.js -==
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");

class Packet13PlayerPositionAndLook extends Packet {
	constructor(x = 0, y = 65, stance = 67, z = 0, yaw = 0.0, pitch = 0.0, onGround = true) {
		super(0x0D);

		this.x = x;
		this.y = y;
		this.stance = stance;
		this.z = z;
		this.yaw = yaw;
		this.pitch = pitch;
		this.onGround = onGround;
	}

	writePacket() {
		super.writePacket();

		this.writer.writeDouble(this.x);
		this.writer.writeDouble(this.y);
		this.writer.writeDouble(this.stance);
		this.writer.writeDouble(this.z);
		this.writer.writeFloat(this.yaw);
		this.writer.writeFloat(this.pitch);
		this.writer.writeBool(this.onGround);

		return this.toBuffer();
	}
}

module.exports = Packet13PlayerPositionAndLook;