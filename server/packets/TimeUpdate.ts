import { Reader, Writer } from "../../bufferStuff";
import { Packet } from "../enums/Packet";
import { IPacket } from "./IPacket";

export class PacketTimeUpdate implements IPacket {
	public packetId = Packet.TimeUpdate;
	public time:bigint;

	public constructor(time:bigint) {
		this.time = time;
	}

	public readData(reader:Reader) {
		this.time = reader.readLong();

		return this;
	}

	public writeData() {
		return new Writer(9).writeUByte(this.packetId).writeLong(this.time).toBuffer();
	}
}