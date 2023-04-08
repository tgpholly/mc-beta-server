import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketPlayerPositionLook implements IPacket {
	public packetId = Packets.PlayerPosition;
	public x:number;
	public y:number;
	public stance:number;
	public z:number;
	public yaw:number;
	public pitch:number;
	public onGround:boolean;

	public constructor(x:number, y:number, stance:number, z:number, yaw:number, pitch:number, onGround:boolean = false) {
		this.x = x;
		this.y = y;
		this.stance = stance;
		this.z = z;
		this.yaw = yaw;
		this.pitch = pitch;
		this.onGround = onGround;
	}

	public readData(reader:Reader) {
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
		return new Writer(42).writeUByte(this.packetId).writeDouble(this.x).writeDouble(this.y).writeDouble(this.stance).writeDouble(this.z).writeFloat(this.yaw).writeFloat(this.pitch).writeBool(this.onGround).toBuffer();
	}
}