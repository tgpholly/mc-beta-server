import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketKeepAlive implements IPacket {
	public packetId = Packet.KeepAlive;
	private static readonly KeepAliveBuffer:Buffer = createWriter(Endian.BE, 1).writeByte(Packet.KeepAlive).toBuffer();

	public readData(reader:IReader) {
		reader;
		return this;
	}

	public writeData() {
		return PacketKeepAlive.KeepAliveBuffer;
	}
}