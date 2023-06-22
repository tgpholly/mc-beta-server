import { createWriter, IReader, Endian } from "bufferstuff";
import { Chunk } from "../Chunk";
import { deflate } from "zlib";
import { IPacket } from "./IPacket";
import { Packet } from "../enums/Packet";

export class PacketMapChunk implements IPacket {
	public packetId = Packet.MapChunk;
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

	public readData(reader:IReader) {
		// TODO: Implement MapChunk reading
		reader.readBool();

		return this;
	}

	public writeData() {
		return new Promise<Buffer>((resolve, reject) => {
			// TODO: Use block and sky nibble array buffers
			/*const fakeLighting = createWriter(Endian.BE, 16384);
			for (let i = 0; i < 16384; i++) {
				fakeLighting.writeUByte(0xFF);
			}*/

			const data = createWriter(Endian.BE).writeBuffer(this.chunk.getBlockBuffer()).writeBuffer(this.chunk.getMetadataBuffer()).writeBuffer(this.chunk.blockLight.toBuffer()).writeBuffer(this.chunk.skyLight.toBuffer());//.writeBuffer(fakeLighting.toBuffer()).writeBuffer(fakeLighting.toBuffer());

			deflate(data.toBuffer(), (err, data) => {
				if (err) {
					return reject(err);
				}

				resolve(createWriter(Endian.BE, 18).writeUByte(this.packetId).writeInt(this.x << 4).writeShort(this.y).writeInt(this.z << 4).writeUByte(this.sizeX).writeUByte(this.sizeY).writeUByte(this.sizeZ).writeInt(data.length).writeBuffer(data).toBuffer());
			});
		});
	}
}