import { createWriter } from "../../bufferStuff/index";
import { Endian } from "../../bufferStuff/Endian";
import { IPacket } from "./IPacket";
import { IReader } from "../../bufferStuff/readers/IReader";
import { Packet } from "../enums/Packet";

export class PacketDisconnectKick implements IPacket {
	public packetId = Packet.DisconnectKick;
	public reason:string;

	public constructor(reason?:string) {
		if (typeof(reason) === "string") {
			this.reason = reason;
		} else {
			this.reason = "";
		}
	}

	public readData(reader:IReader) {
		this.reason = reader.readString16();
		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 3 + this.reason.length * 2).writeUByte(this.packetId).writeString16(this.reason).toBuffer();
	}
}