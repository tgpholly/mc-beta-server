import { deflate } from "zlib";
import { Reader, Writer } from "../../bufferStuff";
import { Packets } from "../enums/Packets";
import { IPacket } from "./IPacket";
import { Chunk } from "../Chunk";

export class PacketMapChunk implements IPacket {
	public packetId = Packets.MapChunk;
	public x:number;
	public y:number;
	public z:number;
	public sizeX:number;
	public sizeY:number;
	public sizeZ:number;
	public chunk:Chunk;

	public constructor(x:number, y:number, z:number, sizeX:number, sizeY:number, sizeZ:number, chunk:Chunk) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.sizeX = sizeX;
		this.sizeY = sizeY;
		this.sizeZ = sizeZ;
		this.chunk = chunk;
	}

	public readData(reader:Reader) {
		

		return this;
	}

	public writeData() {
		return new Promise<Buffer>((resolve, reject) => {
			const blocks = new Writer(32768);
			const metadata = new Writer(16384);
			const lighting = new Writer(32768);

			let blockMeta = false;
			for (let x = 0; x < 16; x++) {
				for (let z = 0; z < 16; z++) {
					for (let y = 0; y < 128; y++) {
						blocks.writeUByte(this.chunk.getBlockId(x, y, z));
						if (blockMeta) {
							metadata.writeUByte(0);
							// Light level 15 for 2 blocks (1111 1111)
							lighting.writeUByte(0xff); // TODO: Lighting (Client seems to do it's own (when a block update happens) so it's not top priority)
							lighting.writeUByte(0xff);
						}
						// Hack for nibble stuff
						blockMeta = !blockMeta;
					}
				}
			}

			// Write meta and lighting data into block buffer for compression
			blocks.writeBuffer(metadata.toBuffer()).writeBuffer(lighting.toBuffer());

			deflate(blocks.toBuffer(), (err, data) => {
				if (err) {
					return reject(err);
				}

				resolve(new Writer(18).writeUByte(this.packetId).writeInt(this.x).writeShort(this.y).writeInt(this.z).writeUByte(this.sizeX).writeUByte(this.sizeY).writeUByte(this.sizeZ).writeInt(data.length).writeBuffer(data).toBuffer());
			});
		});
	}
}