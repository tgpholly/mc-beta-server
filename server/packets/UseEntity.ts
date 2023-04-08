import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketUseEntity implements IPacket {
	public packetId = Packets.UseEntity;
	public userId:number;
	public targetId:number;
	public leftClick:boolean;

	public constructor(userId:number, targetId:number, leftClick:boolean) {
		this.userId = userId;
		this.targetId = targetId;
		this.leftClick = leftClick;
	}

	public readData(reader:Reader) {
		this.userId = reader.readInt();
		this.targetId = reader.readInt();
		this.leftClick = reader.readBool();

		return this;
	}

	public writeData() {
		return new Writer(10).writeUByte(this.packetId).writeInt(this.userId).writeInt(this.targetId).writeBool(this.leftClick).toBuffer();
	}
}