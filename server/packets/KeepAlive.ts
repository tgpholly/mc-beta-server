import { Reader, Writer } from "../../bufferStuff";
import { Packet } from "../enums/Packet";
import { IPacket } from "./IPacket";

export class PacketKeepAlive implements IPacket {
	public packetId = Packet.KeepAlive;
	private static readonly KeepAliveBuffer:Buffer = new Writer(1).writeByte(Packet.KeepAlive).toBuffer();

	public readData(reader:Reader) {
		reader;
		return this;
	}

	public writeData() {
		return PacketKeepAlive.KeepAliveBuffer;
	}
}