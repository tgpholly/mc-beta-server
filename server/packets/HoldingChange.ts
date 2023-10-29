import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketHoldingChange implements IPacket {
	public packetId = Packet.HoldingChange;
	public slotId:number;

	public constructor(slotId?:number) {
		if (typeof(slotId) === "number") {
			this.slotId = slotId;
		} else {
			this.slotId = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.slotId = reader.readShort();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 3).writeUByte(this.packetId).writeShort(this.slotId).toBuffer();
	}
}