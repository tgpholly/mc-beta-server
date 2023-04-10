import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";

export class PacketNamedEntitySpawn implements IPacket {
	public packetId = Packets.NamedEntitySpawn;
	public entityId:number;
	public playerName:string;
	public x:number;
	public y:number;
	public z:number;
	public yaw:number;
	public pitch:number;
	public currentItem:number;

	public constructor(entityId?:number, playerName?:string, x?:number, y?:number, z?:number, yaw?:number, pitch?:number, currentItem?:number) {
		if (typeof(entityId) === "number" && typeof(playerName) === "string" && typeof(x) === "number" && typeof(y) === "number" && typeof(z) === "number" && typeof(yaw) === "number" && typeof(pitch) === "number" && typeof(currentItem) === "number") {
			this.entityId = entityId;
			this.playerName = playerName;
			this.x = x;
			this.y = y;
			this.z = z;
			this.yaw = yaw;
			this.pitch = pitch;
			this.currentItem = currentItem;
		} else {
			this.entityId = Number.MIN_VALUE;
			this.playerName = "";
			this.x = Number.MIN_VALUE;
			this.y = Number.MIN_VALUE;
			this.z = Number.MIN_VALUE;
			this.yaw = Number.MIN_VALUE;
			this.pitch = Number.MIN_VALUE;
			this.currentItem = Number.MIN_VALUE;
		}
	}

	public readData(reader:Reader) {
		this.entityId = reader.readInt();
		this.playerName = reader.readString();
		this.x = reader.readInt();
		this.y = reader.readInt();
		this.z = reader.readInt();
		this.yaw = reader.readByte();
		this.pitch = reader.readByte();

		return this;
	}

	public writeData() {
		return new Writer(23 + this.playerName.length * 2).writeUByte(this.packetId).writeInt(this.entityId).writeString(this.playerName).writeInt(this.x).writeInt(this.y).writeInt(this.z).writeByte(this.yaw).writeByte(this.pitch).writeShort(this.currentItem).toBuffer();
	}
}