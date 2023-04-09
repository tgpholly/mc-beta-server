import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketDisconnectKick implements IPacket {
	public packetId = Packets.DisconnectKick;
	public reason:string;

	public constructor(reason?:string) {
		if (typeof(reason) === "string") {
			this.reason = reason;
		} else {
			this.reason = "";
		}
	}

	public readData(reader:Reader) {
		this.reason = reader.readString();
		return this;
	}

	public writeData() {
		return new Writer(3 + this.reason.length * 2).writeUByte(this.packetId).writeString(this.reason).toBuffer();
	}
}