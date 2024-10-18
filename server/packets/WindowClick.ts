import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketWindowClick implements IPacket {
	public packetId = Packet.WindowClick;
	public windowId:number;
	public slot:number;
	public rightClick:boolean;
	public actionNumber:number;
	public shift:boolean;
	public itemId:number;
	public itemCount:number;
	public itemUses:number;

	public constructor(windowId?:number, slot?:number, rightClick?:boolean, actionNumber?:number, shift?:boolean, itemId?:number, itemCount?:number, itemUses?:number) {
		if (typeof(windowId) === "number" && typeof(slot) === "number" && typeof(rightClick) === "boolean" && typeof(actionNumber) === "number" && typeof(shift) === "boolean" && typeof(itemId) === "number" && typeof(itemCount) ===  "number" && typeof(itemUses) === "number") {
			this.windowId = windowId;
			this.slot = slot;
			this.rightClick = rightClick;
			this.actionNumber = actionNumber;
			this.shift = shift;
			this.itemId = itemId;
			this.itemCount = itemCount;
			this.itemUses = itemUses;
		} else {
			this.windowId = Number.MIN_VALUE;
			this.slot = Number.MIN_VALUE;
			this.rightClick = false;
			this.actionNumber = Number.MIN_VALUE;
			this.shift = false;
			this.itemId = Number.MIN_VALUE;
			this.itemCount = Number.MIN_VALUE;
			this.itemUses = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.windowId = reader.readByte();
		this.slot = reader.readShort();
		this.rightClick = reader.readBool();
		this.actionNumber = reader.readShort();
		this.shift = reader.readBool();
		this.itemId = reader.readShort();
		this.itemCount = reader.readByte();
		this.itemUses = reader.readShort();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 4).writeUByte(this.packetId).writeByte(this.windowId).writeShort(this.slot).writeBool(this.rightClick).writeShort(this.actionNumber).writeShort(this.itemId).writeByte(this.itemCount).writeShort(this.itemUses).toBuffer();
	}
}