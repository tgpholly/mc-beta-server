import { Reader, Writer } from "../../bufferStuff";
import { Packet } from "../enums/Packet";
import { IPacket } from "./IPacket";

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

	public readData(reader:Reader) {
		// TODO: EntityMetadata reading

		return this;
	}

	public writeData() {
		return new Writer(5).writeUByte(this.packetId).writeInt(this.entityId).writeBuffer(this.metadata).toBuffer();
	}
}