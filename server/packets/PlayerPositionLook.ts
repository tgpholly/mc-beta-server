import { createWriter } from "../../bufferStuff/index";
import { Endian } from "../../bufferStuff/Endian";
import { IPacket } from "./IPacket";
import { IReader } from "../../bufferStuff/readers/IReader";
import { Packet } from "../enums/Packet";

export class PacketPlayerPositionLook implements IPacket {
	public packetId = Packet.PlayerPosition;
	public x:number;
	public y:number;
	public stance:number;
	public z:number;
	public yaw:number;
	public pitch:number;
	public onGround:boolean;

	public constructor(x?:number, y?:number, stance?:number, z?:number, yaw?:number, pitch?:number, onGround?:boolean) {
		if (typeof(x) === "number" && typeof(y) === "number" && typeof(stance) === "number" && typeof(z) === "number" && typeof(yaw) === "number" && typeof(pitch) === "number" && typeof(onGround) === "boolean") {
			this.x = x;
			this.y = y;
			this.stance = stance;
			this.z = z;
			this.yaw = yaw;
			this.pitch = pitch;
			this.onGround = onGround;
		} else {
			this.x = Number.MIN_VALUE;
			this.y = Number.MIN_VALUE;
			this.stance = Number.MIN_VALUE;
			this.z = Number.MIN_VALUE;
			this.yaw = Number.MIN_VALUE;
			this.pitch = Number.MIN_VALUE;
			this.onGround = false;
		}
	}

	public readData(reader:IReader) {
		this.x = reader.readDouble();
		this.y = reader.readDouble();
		this.stance = reader.readDouble();
		this.z = reader.readDouble();
		this.yaw = reader.readFloat();
		this.pitch = reader.readFloat();
		this.onGround = reader.readBool();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 42).writeUByte(this.packetId).writeDouble(this.x).writeDouble(this.y).writeDouble(this.stance).writeDouble(this.z).writeFloat(this.yaw).writeFloat(this.pitch).writeBool(this.onGround).toBuffer();
	}
}