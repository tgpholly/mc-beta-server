import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketEntityLookRelativeMove implements IPacket {
	public packetId = Packet.EntityLookRelativeMove;
	public entityId:number;
	public dX:number;
	public dY:number;
	public dZ:number;
	public yaw:number;
	public pitch:number;

	public constructor(entityId?:number, dX?:number, dY?:number, dZ?:number, yaw?:number, pitch?:number) {
		if (typeof(entityId) == "number" && typeof(dX) === "number" && typeof(dY) === "number" && typeof(dZ) === "number" && typeof(yaw) === "number" && typeof(pitch) === "number") {
			this.entityId = entityId;
			this.dX = dX;
			this.dY = dY;
			this.dZ = dZ;
			this.yaw = yaw;
			this.pitch = pitch;
		} else {
			this.entityId = Number.MIN_VALUE;
			this.dX = Number.MIN_VALUE;
			this.dY = Number.MIN_VALUE;
			this.dZ = Number.MIN_VALUE;
			this.yaw = Number.MIN_VALUE;
			this.pitch = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.entityId = reader.readInt();
		this.dX = reader.readByte();
		this.dY = reader.readByte();
		this.dZ = reader.readByte();
		this.yaw = reader.readByte();
		this.pitch = reader.readByte();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 10).writeUByte(this.packetId).writeInt(this.entityId).writeByte(this.dX).writeByte(this.dY).writeByte(this.dZ).writeByte(this.yaw).writeByte(this.pitch).toBuffer();
	}
}