import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketEntity implements IPacket {
	public packetId = Packets.Entity;
	public entityId:number;

	public constructor(entityId?:number) {
		if (typeof(entityId) == "number") {
			this.entityId = entityId;
		} else {
			this.entityId = Number.MIN_VALUE;
		}
	}

	public readData(reader:Reader) {
		this.entityId = reader.readInt();

		return this;
	}

	public writeData() {
		return new Writer(5).writeUByte(this.packetId).writeInt(this.entityId).toBuffer();
	}
}