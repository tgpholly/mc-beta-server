import { Reader, Writer } from "../../bufferStuff";
import { Packet } from "../enums/Packet";
import { IPacket } from "./IPacket";

export class PacketPlayerLook implements IPacket {
	public packetId = Packet.Player;
	public yaw:number;
	public pitch:number;
	public onGround:boolean;

	public constructor(yaw?:number, pitch?:number, onGround?:boolean) {
		if (typeof(yaw) === "number" && typeof(pitch) === "number" && typeof(onGround) === "boolean") {
			this.yaw = yaw;
			this.pitch = pitch;
			this.onGround = onGround;
		} else {
			this.yaw = Number.MIN_VALUE;
			this.pitch = Number.MIN_VALUE;
			this.onGround = false;
		}
	}

	public readData(reader:Reader) {
		this.yaw = reader.readFloat();
		this.pitch = reader.readFloat();
		this.onGround = reader.readBool();

		return this;
	}

	public writeData() {
		return new Writer(10).writeUByte(this.packetId).writeFloat(this.yaw).writeFloat(this.pitch).writeBool(this.onGround).toBuffer();
	}
}