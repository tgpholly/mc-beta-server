import { Reader, Writer } from "../../bufferStuff";
import { Packet } from "../enums/Packet";
import { IPacket } from "./IPacket";

export class PacketHandshake implements IPacket {
	public packetId:Packet = Packet.Handshake;
	private username:string;

	public constructor(username?:string) {
		if (typeof(username) === "string") {
			this.username = username;
		} else {
			this.username = "";
		}
	}

	public readData(reader:Reader) {
		this.username = reader.readString();

		return this;
	}

	public writeData() {
		return new Writer(5).writeUByte(this.packetId).writeString("-").toBuffer();
	}
}