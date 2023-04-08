import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketPreChunk implements IPacket {
	public packetId = Packets.PreChunk;
	public x:number;
	public z:number;
	public mode:boolean;

	public constructor(x:number, z:number, mode:boolean) {
		this.x = x;
		this.z = z;
		this.mode = mode;
	}

	public readData(reader:Reader) {
		this.x = reader.readInt();
		this.z = reader.readInt();
		this.mode = reader.readBool();

		return this;
	}

	public writeData() {
		return new Writer(10).writeUByte(this.packetId).writeInt(this.x).writeInt(this.z).writeBool(this.mode).toBuffer();
	}
}