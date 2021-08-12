const FunkyArray = require("./Util/funkyArray.js");
const bufferStuff = require("./bufferStuff.js");

module.exports = class {
	constructor() {
		this.chunks = {};

		this.queuedBlockUpdates = new FunkyArray();

		for (let x = -3; x < 4; x++) {
			for (let z = -3; z < 4; z++) {
				this.createChunk(x, z);
			}
		}
	}

	// TODO: Store metadata!
	createChunk(cx = 0, cz = 0) {
		if (this.chunks[cx] == null) this.chunks[cx] = {};
		this.chunks[cx][cz] = {};

		let chunkQueuedBlocks = [];

		for (let y = 0; y < 128; y++) {
			this.chunks[cx][cz][y] = {};
			for (let x = 0; x < 16; x++) {
				this.chunks[cx][cz][y][x] = [];
				for (let z = 0; z < 16; z++) {
					if (y == 64) {
						this.chunks[cx][cz][y][x].push(2);
						// Make a tree :)
						if (Math.random() <= 0.01) {
							const newX = x + (16 * cx), newZ = z + (16 * cz);
							// trunk
							this.setBlock(17, newX, y + 1, newZ);
							this.setBlock(17, newX, y + 2, newZ);
							this.setBlock(17, newX, y + 3, newZ);
							this.setBlock(17, newX, y + 4, newZ);
							// leaves
							this.setBlock(18, newX + 2, y + 3, newZ + 2);
							this.setBlock(18, newX + 1, y + 3, newZ + 2);
							this.setBlock(18, newX, y + 3, newZ + 2);
							this.setBlock(18, newX - 1, y + 3, newZ + 2);
							this.setBlock(18, newX - 2, y + 3, newZ + 2);
						}
					}
					else if (y == 63 || y == 62) this.chunks[cx][cz][y][x].push(3);
					else if (y == 0) this.chunks[cx][cz][y][x].push(7);
					else if (y < 62) this.chunks[cx][cz][y][x].push(1);
					else this.chunks[cx][cz][y][x].push(0);
				}
			}
		}
	}

	multiBlockChunk(chunkX = 0, chunkZ = 0, user) {
		const writer = new bufferStuff.Writer();
	
		// I couldn't figure out how to construct a chunk lmao
		// __ima just send each block individually__ 
		// Using multi block chunks now!
		// TODO: yknow, figure out how to chunk.
		let blocksToSend = [];
		for (let y = 0; y < 128; y++) {
			blocksToSend = [];
			for (let x = 0; x < 16; x++) {
				for (let z = 0; z < 16; z++) {
					if (this.chunks[chunkX][chunkZ][y][x][z] == 0) continue; // don't send air lol
					blocksToSend.push([this.chunks[chunkX][chunkZ][y][x][z], x & 0xf, z & 0xf]);
				}
			}
	
			if (blocksToSend.length > 0) {
				writer.reset();
				writer.writeByte(0x34);
				writer.writeInt(chunkX);
				writer.writeInt(chunkZ);
				writer.writeShort(blocksToSend.length);
				// Block coords
				for (let blocks of blocksToSend) {
					writer.writeShort((blocks[1] << 12 | blocks[2] << 8 | y) - 32768);
				}
				// Block types
				for (let blocks of blocksToSend) {
					writer.writeByte(blocks[0]);
				}
				// Block metadata
				for (let blocks of blocksToSend) {
					writer.writeByte(0);
				}
	
				user.chunksToSend.add(writer.buffer) // so we don't flood the client queue these
			}
		}
	}

	setBlock(id = 0, x = 0, y = 0, z = 0) {
		if (y < 0 || y > 127) throw "Tried to set a block outside of the world!";

		const chunkX = Math.floor(x / 16);
		const chunkZ = Math.floor(z / 16);
		const blockX = x - (16 * chunkX);
		const blockZ = z - (16 * chunkZ);

		// Don't queue a block update if that block is already this block
		//if (this.chunks[chunkX][chunkZ][y][blockX][blockZ] == id) return;

		this.queuedBlockUpdates.add([id, chunkX, chunkZ, y, blockX, blockZ]);
	}
}