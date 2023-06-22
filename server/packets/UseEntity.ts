import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketUseEntity implements IPacket {
	public packetId = Packet.UseEntity;
	public userId:number;
	public targetId:number;
	public leftClick:boolean;

	public constructor(userId:number, targetId:number, leftClick:boolean) {
		this.userId = userId;
		this.targetId = targetId;
		this.leftClick = leftClick;
	}

	public readData(reader:IReader) {
		this.userId = reader.readInt();
		this.targetId = reader.readInt();
		this.leftClick = reader.readBool();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 10).writeUByte(this.packetId).writeInt(this.userId).writeInt(this.targetId).writeBool(this.leftClick).toBuffer();
	}
}