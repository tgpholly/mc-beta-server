import { Reader } from "../../bufferStuff";
import { Packet } from "../enums/Packet";

export interface IPacket {
	packetId: Packet,
	readData: (reader:Reader) => IPacket,
	writeData: () => Buffer|Promise<Buffer>
}