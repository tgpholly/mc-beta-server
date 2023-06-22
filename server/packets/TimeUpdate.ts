import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketTimeUpdate implements IPacket {
	public packetId = Packet.TimeUpdate;
	public time:bigint;

	public constructor(time:bigint) {
		this.time = time;
	}

	public readData(reader:IReader) {
		this.time = reader.readLong();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 9).writeUByte(this.packetId).writeLong(this.time).toBuffer();
	}
}