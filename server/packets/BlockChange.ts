import { createWriter } from "../../bufferStuff/index";
import { Endian } from "../../bufferStuff/Endian";
import { IPacket } from "./IPacket";
import { IReader } from "../../bufferStuff/readers/IReader";
import { Packet } from "../enums/Packet";

export class PacketBlockChange implements IPacket {
	public packetId = Packet.BlockChange;
	public x:number;
	public y:number;
	public z:number;
	public blockType:number;
	public blockMetadata:number;

	public constructor(x?:number, y?:number, z?:number, blockType?:number, blockMetadata?:number) {
		if (typeof(x) == "number" && typeof(y) === "number" && typeof(z) === "number" && typeof(blockType) === "number" && typeof(blockMetadata) === "number") {
			this.x = x;
			this.y = y;
			this.z = z;
			this.blockType = blockType;
			this.blockMetadata = blockMetadata;
		} else {
			this.x = Number.MIN_VALUE;
			this.y = Number.MIN_VALUE;
			this.z = Number.MIN_VALUE;
			this.blockType = Number.MIN_VALUE;
			this.blockMetadata = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.x = reader.readInt();
		this.y = reader.readByte();
		this.z = reader.readInt();
		this.blockType = reader.readByte();
		this.blockMetadata = reader.readByte();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 12).writeUByte(this.packetId).writeInt(this.x).writeByte(this.y).writeInt(this.z).writeByte(this.blockType).writeByte(this.blockMetadata).toBuffer();
	}
}