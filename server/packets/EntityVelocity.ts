import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

const MOTION_MAX = 3.9;
function maxMotion(value:number) {
	if (value < -MOTION_MAX) {
		value = -MOTION_MAX;
	} else if (value > MOTION_MAX) {
		value = MOTION_MAX;
	}

	return value;
}

export class PacketEntityVelocity implements IPacket {
	public packetId = Packet.EntityVelocity;
	public entityId:number;
	public x:number;
	public y:number;
	public z:number;

	public constructor(entityId?:number, x?:number, y?:number, z?:number) {
		if (typeof(entityId) == "number" && typeof(x) === "number" && typeof(y) === "number" && typeof(z) === "number") {
			this.entityId = entityId;
			this.x = maxMotion(x) * 8000;
			this.y = maxMotion(y) * 8000;
			this.z = maxMotion(z) * 8000;
		} else {
			this.entityId = Number.MIN_VALUE;
			this.x = Number.MIN_VALUE;
			this.y = Number.MIN_VALUE;
			this.z = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.entityId = reader.readInt();
		this.x = reader.readShort() / 8000;
		this.y = reader.readShort() / 8000;
		this.z = reader.readShort() / 8000;

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 11).writeUByte(this.packetId).writeInt(this.entityId).writeShort(this.x).writeShort(this.y).writeShort(this.z).toBuffer();
	}
}