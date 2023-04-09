import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketPlayer implements IPacket {
	public packetId = Packets.Player;
	public onGround:boolean;

	public constructor(onGround?:boolean) {
		if (typeof(onGround) === "boolean") {
			this.onGround = onGround;
		} else {
			this.onGround = false;
		}
	}

	public readData(reader:Reader) {
		this.onGround = reader.readBool();

		return this;
	}

	public writeData() {
		return new Writer(2).writeUByte(this.packetId).writeBool(this.onGround).toBuffer();
	}
}