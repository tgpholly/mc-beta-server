import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketPlayerDigging implements IPacket {
	public packetId = Packet.PlayerDigging;
	public status:number;
	public x:number;
	public y:number;
	public z:number;
	public face:number;

	public constructor(status?:number, x?:number, y?:number, z?:number, face?:number) {
		if (typeof(status) == "number" && typeof(x) === "number" && typeof(y) === "number" && typeof(z) === "number" && typeof(face) === "number") {
			this.status = status;
			this.x = x;
			this.y = y;
			this.z = z;
			this.face = face;
		} else {
			this.status = Number.MIN_VALUE;
			this.x = Number.MIN_VALUE;
			this.y = Number.MIN_VALUE;
			this.z = Number.MIN_VALUE;
			this.face = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.status = reader.readByte();
		this.x = reader.readInt();
		this.y = reader.readByte();
		this.z = reader.readInt();
		this.face = reader.readByte();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 12).writeUByte(this.packetId).writeByte(this.status).writeInt(this.x).writeByte(this.y).writeInt(this.z).writeByte(this.face).toBuffer();
	}
}