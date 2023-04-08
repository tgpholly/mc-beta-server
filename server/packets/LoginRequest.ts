import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketLoginRequest implements IPacket {
	public packetId = Packets.LoginRequest;
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

	public readData(reader:Reader) {
		this.protocolVersion = reader.readInt();
		this.username = reader.readString();
		this.mapSeed = Number(reader.readLong());
		this.dimension = reader.readByte();

		return this;
	}

	public writeData() {
		return new Writer(16 + (2 * this.username.length)).writeUByte(this.packetId).writeInt(this.protocolVersion).writeString(this.username).writeLong(this.mapSeed).writeByte(this.dimension).toBuffer();
	}
}