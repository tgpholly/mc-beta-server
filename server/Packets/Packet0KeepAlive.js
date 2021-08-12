const Packet = require("./Packet.js");

class Packet0KeepAlive extends Packet {
	writePacket() {
		super.writePacket();

		return this.toBuffer();
	}
}

module.exports = Packet0KeepAlive;