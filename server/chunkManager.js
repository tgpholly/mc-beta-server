const FunkyArray = require("./Util/funkyArray.js");
const bufferStuff = require("./bufferStuff.js");

const { Worker, isMainThread, parentPort } = require('worker_threads');

const workerPath = __dirname + "/Workers/ChunkPacketGenerator.js";

module.exports = class {
	constructor() {
		this.chunks = {};

		this.queuedBlockUpdates = new FunkyArray();

		global.generatingChunks = true;

		this.threadPool = [];
		this.workPool = new FunkyArray();

		this.toRemove = [];

		for (let i = 0; i < 4; i++) {
			const worker = new Worker(workerPath);
			this.threadPool.push([false, worker]);
			const myID = i;
			worker.on("message", (message) => {
				const user = global.getUserByKey(message[0]);
				for (let square of message[1]) { user.chunksToSend.add(Buffer.from(square)); }
				this.threadPool[myID][0] = false;
				this.toRemove.push(message[2]);
			});
		}

		setInterval(() => {
			if (this.workPool.getLength() > 0) {
				let limit = Math.min(this.workPool.getLength(), this.threadPool.length);
				for (let i = 0; i < limit; i++) {
					for (let i1 = 0; i1 < this.threadPool.length; i1++) {
						let thread = this.threadPool[i1];
						if (!thread[0]) {
							const key = this.workPool.itemKeys[i];
							const item = this.workPool.getByKey(key);
							// Already being processed
							if (item == null) break;
							if (item[0] == true) {
								limit += 1;
								break;
							}
							item[0] = true;
							item[1][4] = key;
							item[1][5] = i1;
							thread[1].postMessage(item[1]);
							thread[0] = true;
							break;
						}
					}
				}

				for (let item of this.toRemove) {
					//console.log("removing item " + this.workPool.getByKey(item)[0]);
					this.workPool.remove(item);
				}
				this.toRemove = [];
			}
		}, 1000 / 20);

		const chunkStartTime = new Date().getTime();
		for (let x = -3; x < 4; x++) {
			for (let z = -3; z < 4; z++) {
				this.createChunk(x, z);
			}
		}
		console.log("Chunk generation took " + (new Date().getTime() - chunkStartTime) + "ms");

		global.generatingChunks = false;
	}

	// TODO: Store metadata!
	createChunk(cx = 0, cz = 0) {
		if (this.chunks[cx] == null) this.chunks[cx] = {};
		this.chunks[cx][cz] = {};

		let chunkQueuedBlocks = [];

		for (let y = 0; y < 128; y++) {
			this.chunks[cx][cz][y] = {};
			for (let x = 0; x < 16; x++) {
				this.chunks[cx][cz][y][x] = {};
				for (let z = 0; z < 16; z++) {
					if (y == 64) {
						// Make a tree :)
						if (Math.random() <= 0.01) {
							this.chunks[cx][cz][y][x][z] = 3;

							const newX = x + (16 * cx), newZ = z + (16 * cz);
							// trunk
							this.setBlock(17, newX, y + 1, newZ);
							this.setBlock(17, newX, y + 2, newZ);
							this.setBlock(17, newX, y + 3, newZ);
							this.setBlock(17, newX, y + 4, newZ);
							// leaves
							// left
							this.setBlock(18, newX, y + 5, newZ);
							// right line
						} else {
							this.chunks[cx][cz][y][x][z] = 2;
						}
					}
					else if (y == 63 || y == 62) this.chunks[cx][cz][y][x][z] = 3;
					else if (y == 0) this.chunks[cx][cz][y][x][z] = 7;
					else if (y < 62) this.chunks[cx][cz][y][x][z] = 1;
					else this.chunks[cx][cz][y][x][z] = 0;
				}
			}
		}
	}

	async multiBlockChunk(chunkX = 0, chunkZ = 0, user) {
		//worker.postMessage([chunkX, chunkZ, this.chunks[chunkX][chunkZ]]);
		this.workPool.add([false, [chunkX, chunkZ, this.chunks[chunkX][chunkZ], user.id, null, null]]);
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