import { createWriter, IReader, Endian } from "bufferstuff";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";
import { SoundEffects } from "../enums/SoundEffects";

export class PacketSoundEffect implements IPacket {
	public packetId = Packet.SoundEffect;
	public effectId:SoundEffects;
	public x:number;
	public y:number;
	public z:number;
	public soundData:number;

	public constructor(effectId:number, x:number, y:number, z:number, soundData:number) {
		if (typeof(effectId) === "number" && typeof(x) === "number" && typeof(y) === "number" && typeof(z) === "number" && typeof(soundData) === "number") {
			this.effectId = effectId;
			this.x = x;
			this.y = y;
			this.z = z;
			this.soundData = soundData;
		} else {
			this.effectId = Number.MIN_VALUE;
			this.x = Number.MIN_VALUE;
			this.y = Number.MIN_VALUE;
			this.z = Number.MIN_VALUE;
			this.soundData = Number.MIN_VALUE;
		}
	}

	public readData(reader:IReader) {
		this.effectId = reader.readInt();
		this.x = reader.readInt();
		this.y = reader.readByte();
		this.z = reader.readInt();
		this.soundData = reader.readInt();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 18).writeUByte(this.packetId).writeInt(this.effectId).writeInt(this.x).writeByte(this.y).writeInt(this.z).writeInt(this.soundData).toBuffer();
	}
}