import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketTimeUpdate implements IPacket {
	public packetId = Packets.TimeUpdate;
	public time:number;

	public constructor(time:number) {
		this.time = time;
	}

	public readData(reader:Reader) {
		this.time = Number(reader.readLong());

		return this;
	}

	public writeData() {
		return new Writer(9).writeUByte(this.packetId).writeLong(this.time).toBuffer();
	}
}