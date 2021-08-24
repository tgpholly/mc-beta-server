/*
	========- Packet0KeepAlive.js -=========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");

class Packet0KeepAlive extends Packet {
	writePacket() {
		super.writePacket();

		return this.toBuffer();
	}
}

module.exports = Packet0KeepAlive;