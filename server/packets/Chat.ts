import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketChat implements IPacket {
	public packetId = Packet.Chat;
	public message:string;

	public constructor(message?:string) {
		if (typeof(message) === "string") {
			this.message = message;
		} else {
			this.message = "";
		}
	}

	public readData(reader:IReader) {
		this.message = reader.readString16();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 3 + this.message.length * 2).writeUByte(this.packetId).writeString16(this.message).toBuffer();
	}
}