/*
	===========- chunkManager.js -==========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const { Worker } = require('worker_threads');
const FunkyArray = require("./Util/funkyArray.js");
const pRandom = require("./Util/prettyRandom.js");
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

		// TODO: Figure out a better way of doing this?
		this.seed = pRandom(-2147483647, 2147483647) - new Date().getTime() * pRandom(1, 6);

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
						const startTime = new Date().getTime();
						this.chunks[data[2]][data[3]] = data[1];
						this.toRemove.push(data[4]);
						const treeBlocksRef = data[5];
						treeBlocksRef.forEach((block) => {
							this.setBlock(block[0], block[1], block[2], block[3]);
						});
						this.threadPool[myID][0] = false;
						console.log(`Trees fin took ${new Date().getTime() - startTime}ms`);
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
		}, 1000 / 60);

		global.generatingChunks = false;
	}

	// TODO: Store metadata!
	createChunk(cx = 0, cz = 0) {
		if (this.chunks[cx] == null) this.chunks[cx] = {};

		this.workPool.add([false, ["generate", cx, cz, null, this.seed]]);
	}

	chunkExists(cx = 0, cz = 0) {
		if (this.chunks[cx] == null) return false;
		if (this.chunks[cx][cz] == null) return false;
		
		// In any other case the chunk exists
		return true;
	}

	multiBlockChunk(chunkX = 0, chunkZ = 0, user) {
		this.workPool.add([false, ["chunk", [chunkX, chunkZ, this.chunks[chunkX][chunkZ]], user.id, null]]);
	}

	setBlock(x = 0, y = 0, z = 0, id = 0, metadata = 0) {
		if (y < 0 || y > 127) return console.error("Tried to set a block outside of the world!");

		const chunkX = x >> 4;
		const chunkZ = z >> 4;
		const blockX = x - (chunkX << 4);
		const blockZ = z - (chunkZ << 4);

		// Don't queue a block update if that block is already this block (wow those ifs)
		if (this.chunks[chunkX] != null)
			if (this.chunks[chunkX][chunkZ] != null)
				if (this.chunks[chunkX][chunkZ][y][blockX][blockZ] == id) return;

		this.queuedBlockUpdates.add([chunkX, chunkZ, y, blockX, blockZ, id, metadata]);
	}
}