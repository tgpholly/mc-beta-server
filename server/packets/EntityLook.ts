import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketEntityLook implements IPacket {
	public packetId = Packet.EntityLook;
	public entityId:number;
	public yaw:number;
	public pitch:number;

	public constructor(entityId?:number, yaw?:number, pitch?:number) {
		if (typeof(entityId) == "number" && typeof(yaw) === "number" && typeof(pitch) === "number") {
			this.entityId = entityId;
			this.yaw = yaw;
			this.pitch = pitch;
		} else {
			this.entityId = Number.MIN_VALUE;
			this.yaw = Number.MIN_VALUE;
			this.pitch = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.entityId = reader.readInt();
		this.yaw = reader.readByte();
		this.pitch = reader.readByte();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 7).writeUByte(this.packetId).writeInt(this.entityId).writeByte(this.yaw).writeByte(this.pitch).toBuffer();
	}
}