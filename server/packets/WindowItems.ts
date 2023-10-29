import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketWindowItems implements IPacket {
	public packetId = Packet.WindowItems;
	public windowId:number;
	public count:number;
	public payload:Buffer;

	public constructor(windowId?:number, count?:number, payload?:Buffer) {
		if (typeof(windowId) === "number" && typeof(count) === "number" && payload instanceof Buffer) {
			this.windowId = windowId;
			this.count = count;
			this.payload = payload;
		} else {
			this.windowId = Number.MIN_VALUE;
			this.count = Number.MIN_VALUE;
			this.payload = Buffer.alloc(0);
		}
	}

	public readData(reader:IReader) {
		reader.readByte();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 4).writeUByte(this.packetId).writeByte(this.windowId).writeShort(this.count).writeBuffer(this.payload).toBuffer();
	}
}