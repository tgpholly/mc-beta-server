import { createWriter } from "../../bufferStuff/index";
import { Endian } from "../../bufferStuff/Endian";
import { IPacket } from "./IPacket";
import { IReader } from "../../bufferStuff/readers/IReader";
import { Packet } from "../enums/Packet";

export class PacketPlayerPosition implements IPacket {
	public packetId = Packet.PlayerPosition;
	public x:number;
	public y:number;
	public stance:number;
	public z:number;
	public onGround:boolean;

	public constructor(x?:number, y?:number, stance?:number, z?:number, onGround?:boolean) {
		if (typeof(x) === "number" && typeof(y) === "number" && typeof(stance) === "number" && typeof(z) === "number" && typeof(onGround) === "boolean") {
			this.x = x;
			this.y = y;
			this.stance = stance;
			this.z = z;
			this.onGround = onGround;
		} else {
			this.x = Number.MIN_VALUE;
			this.y = Number.MIN_VALUE;
			this.stance = Number.MIN_VALUE;
			this.z = Number.MIN_VALUE;
			this.onGround = false;
		}
	}

	public readData(reader:IReader) {
		this.x = reader.readDouble();
		this.y = reader.readDouble();
		this.stance = reader.readDouble();
		this.z = reader.readDouble();
		this.onGround = reader.readBool();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 34).writeUByte(this.packetId).writeDouble(this.x).writeDouble(this.y).writeDouble(this.stance).writeDouble(this.z).writeBool(this.onGround).toBuffer();
	}
}