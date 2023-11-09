import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketPickupSpawn implements IPacket {
	public packetId = Packet.PickupSpawn;
	public entityId:number;
	public item:number;
	public count:number;
	public damage:number;
	public x:number;
	public y:number;
	public z:number;
	public yaw:number;
	public pitch:number;
	public roll:number;

	public constructor(entityId?:number, item?:number, count?:number, damage?:number, x?:number, y?:number, z?:number, yaw?:number, pitch?:number, roll?:number) {
		if (typeof(entityId) === "number" && typeof(item) === "number" && typeof(count) === "number" && typeof(damage) === "number" && typeof(x) === "number" && typeof(y) === "number" && typeof(z) === "number" && typeof(yaw) === "number" && typeof(pitch) === "number" && typeof(roll) === "number") {
			this.entityId = entityId;
			this.item = item;
			this.count = count;
			this.damage = damage;
			this.x = x;
			this.y = y;
			this.z = z;
			this.yaw = yaw;
			this.pitch = pitch;
			this.roll = roll;
		} else {
			this.entityId = Number.MIN_VALUE;
			this.item = Number.MIN_VALUE;
			this.count = Number.MIN_VALUE;
			this.damage = Number.MIN_VALUE;
			this.x = Number.MIN_VALUE;
			this.y = Number.MIN_VALUE;
			this.z = Number.MIN_VALUE;
			this.yaw = Number.MIN_VALUE;
			this.pitch = Number.MIN_VALUE;
			this.roll = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.entityId = reader.readInt();
		this.item = reader.readShort();
		this.count = reader.readByte();
		this.damage = reader.readShort();
		this.x = reader.readInt();
		this.y = reader.readInt();
		this.z = reader.readInt();
		this.yaw = reader.readByte();
		this.pitch = reader.readByte();
		this.roll = reader.readByte();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 25).writeUByte(this.packetId).writeInt(this.entityId).writeShort(this.item).writeByte(this.count).writeShort(this.damage).writeInt(this.x).writeInt(this.y).writeInt(this.z).writeByte(this.yaw).writeByte(this.pitch).writeByte(this.roll).toBuffer();
	}
}