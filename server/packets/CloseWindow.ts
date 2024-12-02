import { createWriter, IReader, Endian } from "bufferstuff";
import IPacket from "./IPacket";
import Packet from "../enums/Packet";

export default class PacketCloseWindow implements IPacket {
	public packetId = Packet.CloseWindow;
	public windowId:number;

	public constructor(windowId?:number) {
		this.windowId = windowId ?? Number.MIN_VALUE;
	}

	public readData(reader:IReader) {
		this.windowId = reader.readByte();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE, 2).writeUByte(this.packetId).writeByte(this.windowId).toBuffer();
	}
}