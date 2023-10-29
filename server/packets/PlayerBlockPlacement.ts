import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketPlayerBlockPlacement implements IPacket {
	public packetId = Packet.PlayerBlockPlacement;
	public x:number;
	public y:number;
	public z:number;
	public face:number;
	public blockOrItemId:number;
	public amount?:number;
	public damage?:number;

	public constructor(x?:number, y?:number, z?:number, face?:number, blockOrItemId?:number, amount?:number, damage?:number) {
		if (typeof(x) === "number" && typeof(y) === "number" && typeof(z) === "number" && typeof(face) === "number" && typeof(blockOrItemId) === "number") {
			this.x = x;
			this.y = y;
			this.z = z;
			this.face = face;
			this.blockOrItemId = blockOrItemId;
			
		} else {
			this.x = Number.MIN_VALUE;
			this.y = Number.MIN_VALUE;
			this.z = Number.MIN_VALUE;
			this.face = Number.MIN_VALUE;
			this.blockOrItemId = Number.MIN_VALUE;
		}

		this.amount = amount;
		this.damage = damage;
	}

	public readData(reader:IReader) {
		this.x = reader.readInt();
		this.y = reader.readByte();
		this.z = reader.readInt();
		this.face = reader.readByte();
		this.blockOrItemId = reader.readShort();
		if (this.blockOrItemId >= 0) {
			this.amount = reader.readByte();
			this.damage = reader.readShort();
		}

		return this;
	}

	private calculatePacketSize() {
		return this.blockOrItemId >= 0 && this.amount != null && this.damage != null ? 16 : 13;
	}

	public writeData() {
		const packetSize = this.calculatePacketSize();

		const writer = createWriter(Endian.BE, packetSize)
			.writeUByte(this.packetId)
			.writeInt(this.x)
			.writeByte(this.y)
			.writeInt(this.z)
			.writeByte(this.face)
			.writeShort(this.blockOrItemId);

		if (this.amount != null && this.damage != null) {
			writer.writeByte(this.amount).writeShort(this.damage);
		}

		return writer.toBuffer();
	}
}