const { Worker } = require('worker_threads');
const FunkyArray = require("./Util/funkyArray.js");
const config = require("../config.json");

const workerPath = `${__dirname}/Workers/ChunkWorker.js`;

module.exports = class {
	constructor() {
		this.chunks = {};

		this.queuedBlockUpdates = new FunkyArray();

		global.generatingChunks = true;

		this.threadPool = [];
		this.workPool = new FunkyArray();
		this.toRemove = [];

		// WoAh!!! Thread pool in js!?!??!???!11!?!?!
		for (let i = 0; i < config.worldThreads; i++) {
			const worker = new Worker(workerPath);
			this.threadPool.push([false, worker]);
			const myID = i;
			worker.on("message", (data) => {
				let user;
				switch (data[0]) {
					case "chunk":
						user = global.getUserByKey(data[2]);
						user.chunksToSend.add(Buffer.from(data[1]));
						this.toRemove.push(data[1]);
						this.threadPool[myID][0] = false;
					break;

					case "generate":
						this.chunks[data[2]][data[3]] = data[1];
						this.toRemove.push(data[4]);
						this.threadPool[myID][0] = false;
					break;
				}
			});
		}

		console.log("Created thread pool with " + this.threadPool.length + " threads");

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
							item[1][3] = key;
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

		for (let x = -3; x < 4; x++) {
			for (let z = -3; z < 4; z++) {
				this.createChunk(x, z);
			}
		}

		global.generatingChunks = false;
	}

	// TODO: Store metadata!
	createChunk(cx = 0, cz = 0) {
		if (this.chunks[cx] == null) this.chunks[cx] = {};

		this.workPool.add([false, ["generate", cx, cz, null]]);
	}

	multiBlockChunk(chunkX = 0, chunkZ = 0, user) {
		this.workPool.add([false, ["chunk", [chunkX, chunkZ, this.chunks[chunkX][chunkZ]], user.id, null]]);
	}

	setBlock(id = 0, x = 0, y = 0, z = 0) {
		if (y < 0 || y > 127) return console.error("Tried to set a block outside of the world!");

		const chunkX = Math.floor(x >> 4);
		const chunkZ = Math.floor(z >> 4);
		const blockX = x - (16 * chunkX);
		const blockZ = z - (16 * chunkZ);

		// Don't queue a block update if that block is already this block
		//if (this.chunks[chunkX][chunkZ][y][blockX][blockZ] == id) return;

		this.queuedBlockUpdates.add([id, chunkX, chunkZ, y, blockX, blockZ]);
	}
}