import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketEntityEquipment implements IPacket {
	public packetId = Packet.EntityEquipment;
	public entityId:number;
	public slot:number;
	public itemId:number;
	public damage:number;

	public constructor(entityId:number, slot:number, itemId:number, damage:number) {
		this.entityId = entityId;
		this.slot = slot;
		this.itemId = itemId;
		this.damage = damage;
	}

	public readData(reader:IReader) {
		this.entityId = reader.readInt();
		this.slot = reader.readShort();
		this.itemId = reader.readShort();
		this.damage = reader.readShort();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 10).writeUByte(this.packetId).writeInt(this.entityId).writeShort(this.slot).writeShort(this.itemId).writeShort(this.damage).toBuffer();
	}
}