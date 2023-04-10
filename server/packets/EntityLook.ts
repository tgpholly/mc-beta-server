import { Reader, Writer } from "../../bufferStuff";
import { Packet } from "../enums/Packet";
import { IPacket } from "./IPacket";

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

	public readData(reader:Reader) {
		this.entityId = reader.readInt();
		this.yaw = reader.readByte();
		this.pitch = reader.readByte();

		return this;
	}

	public writeData() {
		return new Writer(7).writeUByte(this.packetId).writeInt(this.entityId).writeByte(this.yaw).writeByte(this.pitch).toBuffer();
	}
}