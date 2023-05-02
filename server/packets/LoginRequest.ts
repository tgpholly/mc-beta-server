import { createWriter } from "../../bufferStuff/index";
import { Endian } from "../../bufferStuff/Endian";
import { IPacket } from "./IPacket";
import { IReader } from "../../bufferStuff/readers/IReader";
import { Packet } from "../enums/Packet";

export class PacketLoginRequest implements IPacket {
	public packetId = Packet.LoginRequest;
	public protocolVersion:number;
	public username:string;
	public mapSeed:number;
	public dimension:number;

	public constructor(protocolVersion?:number, username?:string, mapSpeed?:number, dimension?:number) {
		if (typeof(protocolVersion) === "number" && typeof(username) === "string" && typeof(mapSpeed) === "number" && typeof(dimension) === "number") {
			this.protocolVersion = protocolVersion;
			this.username = username;
			this.mapSeed = mapSpeed;
			this.dimension = dimension;
		} else {
			this.protocolVersion = Number.MIN_VALUE;
			this.username = "";
			this.mapSeed = Number.MIN_VALUE;
			this.dimension = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.protocolVersion = reader.readInt();
		this.username = reader.readString16();
		this.mapSeed = Number(reader.readLong());
		this.dimension = reader.readByte();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 16 + (2 * this.username.length)).writeUByte(this.packetId).writeInt(this.protocolVersion).writeString16(this.username).writeLong(this.mapSeed).writeByte(this.dimension).toBuffer();
	}
}