import { Reader, Writer } from "../../bufferStuff";
import { Packet } from "../enums/Packet";
import { IPacket } from "./IPacket";

export class PacketEntityTeleport implements IPacket {
	public packetId = Packet.EntityTeleport;
	public entityId:number;
	public x:number;
	public y:number;
	public z:number;
	public yaw:number;
	public pitch:number;

	public constructor(entityId?:number, x?:number, y?:number, z?:number, yaw?:number, pitch?:number) {
		if (typeof(entityId) == "number" && typeof(x) === "number" && typeof(y) === "number" && typeof(z) === "number" && typeof(yaw) === "number" && typeof(pitch) === "number") {
			this.entityId = entityId;
			this.x = x;
			this.y = y;
			this.z = z;
			this.yaw = yaw;
			this.pitch = pitch;
		} else {
			this.entityId = Number.MIN_VALUE;
			this.x = Number.MIN_VALUE;
			this.y = Number.MIN_VALUE;
			this.z = Number.MIN_VALUE;
			this.yaw = Number.MIN_VALUE;
			this.pitch = Number.MIN_VALUE;
		}
	}

	public readData(reader:Reader) {
		this.entityId = reader.readInt();
		this.x = reader.readInt();
		this.y = reader.readInt();
		this.z = reader.readInt();
		this.yaw = reader.readByte();
		this.pitch = reader.readByte();

		return this;
	}

	public writeData() {
		return new Writer(19).writeUByte(this.packetId).writeInt(this.entityId).writeInt(this.x).writeInt(this.y).writeInt(this.z).writeByte(this.yaw).writeByte(this.pitch).toBuffer();
	}
}