import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketUpdateHealth implements IPacket {
	public packetId = Packet.UpdateHealth;
	public health:number;

	public constructor(health:number) {
		this.health = health;
	}

	public readData(reader:IReader) {
		this.health = reader.readShort();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 3).writeUByte(this.packetId).writeShort(this.health).toBuffer();
	}
}