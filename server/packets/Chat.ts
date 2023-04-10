import { Reader, Writer } from "../../bufferStuff";
import { Packet } from "../enums/Packet";
import { IPacket } from "./IPacket";

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

	public readData(reader:Reader) {
		this.message = reader.readString();

		return this;
	}

	public writeData() {
		return new Writer(3 + this.message.length * 2).writeUByte(this.packetId).writeString(this.message).toBuffer();
	}
}