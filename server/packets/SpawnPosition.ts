import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketSpawnPosition implements IPacket {
	public packetId = Packet.SpawnPosition;
	public x:number;
	public y:number;
	public z:number;

	public constructor(x:number, y:number, z:number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	public readData(reader:IReader) {
		this.x = reader.readInt();
		this.y = reader.readInt();
		this.z = reader.readInt();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 13).writeUByte(this.packetId).writeInt(this.x).writeInt(this.y).writeInt(this.z).toBuffer();
	}
}