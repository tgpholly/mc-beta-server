import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

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

	public readData(reader:IReader) {
		this.entityId = reader.readInt();
		this.animation = reader.readByte();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 6).writeUByte(this.packetId).writeInt(this.entityId).writeByte(this.animation).toBuffer();
	}
}