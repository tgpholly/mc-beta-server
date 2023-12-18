import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketSetSlot implements IPacket {
	public packetId = Packet.SetSlot;
	public windowId:number;
	public slot:number;
	public itemId:number;
	public itemCount:number;
	public itemUses:number;

	public constructor(windowId?:number, slot?:number, itemId?:number, itemCount?:number, itemUses?:number) {
		if (typeof(windowId) === "number" && typeof(slot) === "number" && typeof(itemId) === "number" && typeof(itemCount) === "number" && typeof(itemUses) === "number") {
			this.windowId = windowId;
			this.slot = slot;
			this.itemId = itemId;
			this.itemCount = itemCount;
			this.itemUses = itemUses;
		} else {
			this.windowId = Number.MIN_VALUE;
			this.slot = Number.MIN_VALUE;
			this.itemId = Number.MIN_VALUE;
			this.itemCount = Number.MIN_VALUE;
			this.itemUses = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.windowId = reader.readByte();
		this.slot = reader.readShort();
		this.itemId = reader.readShort();
		if (this.itemId !== -1) {
			this.itemCount = reader.readByte();
			this.itemUses = reader.readShort();
		}

		return this;
	}

	public writeData() {
		const writer = createWriter(Endian.BE, this.itemId === -1 ? 6 : 9).writeUByte(this.packetId).writeByte(this.windowId).writeShort(this.slot).writeShort(this.itemId);
		if (this.itemId !== -1) {
			writer.writeByte(this.itemCount);
			writer.writeShort(this.itemUses);
		}
		return writer.toBuffer();
	}
}