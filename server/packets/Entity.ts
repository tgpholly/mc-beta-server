import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketEntity implements IPacket {
	public packetId = Packet.Entity;
	public entityId:number;

	public constructor(entityId?:number) {
		if (typeof(entityId) == "number") {
			this.entityId = entityId;
		} else {
			this.entityId = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.entityId = reader.readInt();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 5).writeUByte(this.packetId).writeInt(this.entityId).toBuffer();
	}
}