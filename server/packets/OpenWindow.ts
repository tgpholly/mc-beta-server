import { createWriter, Endian, IReader } from "bufferstuff";
import InventoryType from "../enums/InventoryType";
import Packet from "../enums/Packet";
import IPacket from "./IPacket";

export default class PacketOpenWindow implements IPacket {
	public packetId = Packet.OpenWindow;
	public windowId:number;
	public inventoryType:InventoryType;
	public windowTitle: string;
	public numberOfSlots: number;

	public constructor(windowId?: number, inventoryType?: InventoryType, windowTitle?: string, numberOfSlots?: number) {
		if (typeof(windowId) === "number" && typeof(inventoryType) === "number" && typeof(windowTitle) === "string" && typeof(numberOfSlots) === "number") {
			this.windowId = windowId;
			this.inventoryType = inventoryType;
			this.windowTitle = windowTitle;
			this.numberOfSlots = numberOfSlots;
		}   else {
			this.windowId = Number.MIN_VALUE;
			this.inventoryType = Number.MIN_VALUE;
			this.windowTitle =  "";
			this.numberOfSlots = Number.MIN_VALUE;
		}
	}

	public readData(reader: IReader) {
		this.windowId = reader.readByte();
		this.inventoryType = reader.readByte();
		this.windowTitle = reader.readString();
		this.numberOfSlots = reader.readByte();

		return this;
	}

	public writeData() {
		return createWriter(Endian.BE).writeUByte(this.packetId).writeByte(this.windowId).writeByte(this.inventoryType).writeJavaUTF(this.windowTitle).writeByte(this.numberOfSlots).toBuffer();
	}
}