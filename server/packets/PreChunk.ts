import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketPreChunk implements IPacket {
	public packetId = Packet.PreChunk;
	public x:number;
	public z:number;
	public mode:boolean;

	public constructor(x:number, z:number, mode:boolean) {
		this.x = x;
		this.z = z;
		this.mode = mode;
	}

	public readData(reader:IReader) {
		this.x = reader.readInt();
		this.z = reader.readInt();
		this.mode = reader.readBool();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 10).writeUByte(this.packetId).writeInt(this.x).writeInt(this.z).writeBool(this.mode).toBuffer();
	}
}