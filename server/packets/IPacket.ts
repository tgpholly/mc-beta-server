import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";

export interface IPacket {
	packetId: Packets,
	readData: (reader:Reader) => IPacket,
	writeData: () => Buffer|Promise<Buffer>
}