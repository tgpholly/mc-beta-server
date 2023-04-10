import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketEntityRelativeMove implements IPacket {
	public packetId = Packets.EntityRelativeMove;
	public entityId:number;
	public dX:number;
	public dY:number;
	public dZ:number;

	public constructor(entityId?:number, dX?:number, dY?:number, dZ?:number) {
		if (typeof(entityId) == "number" && typeof(dX) === "number" && typeof(dY) === "number" && typeof(dZ) === "number") {
			this.entityId = entityId;
			this.dX = dX;
			this.dY = dY;
			this.dZ = dZ;
		} else {
			this.entityId = Number.MIN_VALUE;
			this.dX = Number.MIN_VALUE;
			this.dY = Number.MIN_VALUE;
			this.dZ = Number.MIN_VALUE;
		}
	}

	public readData(reader:Reader) {
		this.entityId = reader.readInt();
		this.dX = reader.readByte();
		this.dY = reader.readByte();
		this.dZ = reader.readByte();

		return this;
	}

	public writeData() {
		return new Writer(8).writeUByte(this.packetId).writeInt(this.entityId).writeByte(this.dX).writeByte(this.dY).writeByte(this.dZ).toBuffer();
	}
}