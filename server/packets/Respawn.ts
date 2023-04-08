import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketRespawn implements IPacket {
	public packetId = Packets.Respawn;
	public health:number;

	public constructor(health:number) {
		this.health = health;
	}

	public readData(reader:Reader) {
		this.health = reader.readShort();

		return this;
	}

	public writeData() {
		return new Writer(3).writeUByte(this.packetId).writeShort(this.health).toBuffer();
	}
}