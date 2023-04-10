import { Reader, Writer } from "../../bufferStuff";
import { Packet } from "../enums/Packet";
import { IPacket } from "./IPacket";

export class PacketEntityAction implements IPacket {
	public packetId = Packet.EntityAction;
	public entityId:number;
	public action:number;

	public constructor(entityId?:number, action?:number) {
		if (typeof(entityId) == "number" && typeof(action) === "number") {
			this.entityId = entityId;
			this.action = action;
		} else {
			this.entityId = Number.MIN_VALUE;
			this.action = Number.MIN_VALUE;
		}
	}

	public readData(reader:Reader) {
		this.entityId = reader.readInt();
		this.action = reader.readByte();

		return this;
	}

	public writeData() {
		return new Writer(6).writeUByte(this.packetId).writeInt(this.entityId).writeByte(this.action).toBuffer();
	}
}