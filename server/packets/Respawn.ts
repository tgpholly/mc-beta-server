import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketRespawn implements IPacket {
	public packetId = Packet.Respawn;
	public dimension:number;

	public constructor(dimension?:number) {
		if (typeof(dimension) == "number") {
			this.dimension = dimension;
		} else {
			this.dimension = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.dimension = reader.readByte();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 2).writeUByte(this.packetId).writeByte(this.dimension).toBuffer();
	}
}