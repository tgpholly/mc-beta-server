/*
	========- Packet103SetSlot.js -=========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");

class Packet103SetSlot extends Packet {
	constructor(window_id = 0, slot = 0, item_id = -1, item_count = 0, item_uses = 0) {
		super(0x67);

		this.window_id = window_id;
		this.slot = slot;
		this.item_id = item_id;
		this.item_count = item_count;
		this.item_uses = item_uses;
	}

	writePacket() {
		super.writePacket();

		this.writer.writeByte(this.window_id);
		this.writer.writeShort(this.slot);
		this.writer.writeShort(this.item_id);
		this.writer.writeByte(this.item_count);
		if (this.item_id != -1) this.writer.writeShort(this.item_uses);

		return this.toBuffer();
	}
}

module.exports = Packet103SetSlot;