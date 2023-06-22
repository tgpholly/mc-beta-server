import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketPlayer implements IPacket {
	public packetId = Packet.Player;
	public onGround:boolean;

	public constructor(onGround?:boolean) {
		if (typeof(onGround) === "boolean") {
			this.onGround = onGround;
		} else {
			this.onGround = false;
		}
	}

	public readData(reader:IReader) {
		this.onGround = reader.readBool();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 2).writeUByte(this.packetId).writeBool(this.onGround).toBuffer();
	}
}