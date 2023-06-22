import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

const EMPTY_BUFFER = Buffer.alloc(0);

export class PacketEntityMetadata implements IPacket {
	public packetId = Packet.EntityMetadata;
	public entityId:number;
	public metadata:Buffer;

	public constructor(entityId?:number, metadata?:Buffer) {
		if (typeof(entityId) == "number" && metadata instanceof Buffer) {
			this.entityId = entityId;
			this.metadata = metadata;
		} else {
			this.entityId = Number.MIN_VALUE;
			this.metadata = EMPTY_BUFFER;
		}
	}

	public readData(reader:IReader) {
		// TODO: EntityMetadata reading

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 5).writeUByte(this.packetId).writeInt(this.entityId).writeBuffer(this.metadata).toBuffer();
	}
}