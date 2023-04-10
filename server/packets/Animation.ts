import { Reader, Writer } from "../../bufferStuff";
import { Packet } from "../enums/Packet";
import { IPacket } from "./IPacket";

export class PacketAnimation implements IPacket {
	public packetId = Packet.Animation;
	public entityId:number;
	public animation:number;

	public constructor(entityId?:number, animation?:number) {
		if (typeof(entityId) == "number" && typeof(animation) === "number") {
			this.entityId = entityId;
			this.animation = animation;
		} else {
			this.entityId = Number.MIN_VALUE;
			this.animation = Number.MIN_VALUE;
		}
	}

	public readData(reader:Reader) {
		this.entityId = reader.readInt();
		this.animation = reader.readByte();

		return this;
	}

	public writeData() {
		return new Writer(6).writeUByte(this.packetId).writeInt(this.entityId).writeByte(this.animation).toBuffer();
	}
}