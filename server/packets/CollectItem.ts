import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketCollectItem implements IPacket {
	public packetId = Packet.CollectItem;
	public collectedEID:number;
	public collectorEID:number;

	public constructor(collectedEID?:number, collectorEID?:number) {
		if (typeof(collectedEID) === "number" && typeof(collectorEID) === "number") {
			this.collectedEID = collectedEID;
			this.collectorEID = collectorEID;
		} else {
			this.collectedEID = Number.MIN_VALUE;
			this.collectorEID = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.collectedEID = reader.readInt();
		this.collectorEID = reader.readInt();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 9).writeUByte(this.packetId).writeInt(this.collectedEID).writeInt(this.collectorEID).toBuffer();
	}
}