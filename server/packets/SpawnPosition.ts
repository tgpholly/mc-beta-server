import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketSpawnPosition implements IPacket {
	public packetId = Packets.SpawnPosition;
	public x:number;
	public y:number;
	public z:number;

	public constructor(x:number, y:number, z:number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	public readData(reader:Reader) {
		this.x = reader.readInt();
		this.y = reader.readInt();
		this.z = reader.readInt();

		return this;
	}

	public writeData() {
		return new Writer(13).writeUByte(this.packetId).writeInt(this.x).writeInt(this.y).writeInt(this.z).toBuffer();
	}
}