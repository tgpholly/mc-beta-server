import { IReader } from "bufferstuff";
import { Packet } from "../enums/Packet";

export interface IPacket {
	packetId: Packet,
	readData: (reader:IReader) => IPacket,
	writeData: () => Buffer|Promise<Buffer>
}