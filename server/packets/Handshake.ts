import { createWriter, IReader, Endian } from "bufferstuff";
import IPacket from "./IPacket";
import Packet from "../enums/Packet";

export default class PacketHandshake implements IPacket {
	public packetId: Packet = Packet.Handshake;
	private username: string;

	public constructor(username?: string) {
		if (typeof(username) === "string") {
			this.username = username;
		} else {
			this.username = "-";
		}
	}

	public readData(reader:IReader) {
		this.username = reader.readString16();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE).writeUByte(this.packetId).writeString16(this.username).toBuffer();
	}
}