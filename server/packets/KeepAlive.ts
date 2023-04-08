import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketKeepAlive implements IPacket {
	public packetId = Packets.KeepAlive;
	private static readonly KeepAliveBuffer:Buffer = new Writer(1).writeByte(Packets.KeepAlive).toBuffer();

	public readData(reader:Reader) {
		return this;
	}

	public writeData() {
		return PacketKeepAlive.KeepAliveBuffer;
	}
}