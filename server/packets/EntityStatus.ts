import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketEntityStatus implements IPacket {
	public packetId = Packet.EntityStatus;
	public entityId:number;
	public status:number;

	public constructor(entityId?:number, status?:number) {
		if (typeof(entityId) == "number" && typeof(status) === "number") {
			this.entityId = entityId;
			this.status = status;
		} else {
			this.entityId = Number.MIN_VALUE;
			this.status = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.entityId = reader.readInt();
		this.status = reader.readByte();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 6).writeUByte(this.packetId).writeInt(this.entityId).writeByte(this.status).toBuffer();
	}
}