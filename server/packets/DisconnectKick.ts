import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketDisconnectKick implements IPacket {
	public packetId = Packets.DisconnectKick;
	public reason:string;

	public constructor(reason:string) {
		this.reason = reason;
	}

	public readData(reader:Reader) {
		return this;
	}

	public writeData() {
		return new Writer(3 + this.reason.length * 2).writeUByte(this.packetId).writeString(this.reason).toBuffer();
	}
}