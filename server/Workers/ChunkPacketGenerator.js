const { Worker, MessageChannel, MessagePort, isMainThread, parentPort } = require('worker_threads');

const bufferStuff = require("../bufferStuff.js");

let chunkY = 0;
let busyInterval = null;

parentPort.on("message", (chunk) => {
	if (busyInterval == null) {
		busyInterval = setInterval(() => {}, 86400000);
	}

	chunkY = 0;
	// I couldn't figure out how to construct a chunk lmao
	// __ima just send each block individually__ 
	// Using multi block chunks now!
	// TODO: yknow, figure out how to chunk.
	let chunksToSend = [];

	chunksToSend.push(doSquareChunk(chunk));
	chunkY += 16;
	chunksToSend.push(doSquareChunk(chunk));
	chunkY += 16;
	chunksToSend.push(doSquareChunk(chunk));
	chunkY += 16;
	chunksToSend.push(doSquareChunk(chunk));
	chunkY += 16;
	chunksToSend.push(doSquareChunk(chunk));
	chunkY += 16;
	chunksToSend.push(doSquareChunk(chunk));
	chunkY += 16;
	chunksToSend.push(doSquareChunk(chunk));
	chunkY += 16;
	chunksToSend.push(doSquareChunk(chunk));

	parentPort.postMessage([chunk[3], chunksToSend, chunk[4], chunk[5]]);
});

function doSquareChunk(chunk) {
	let blocksToSend = [];
	for (let y = 0; y < 16; y++) {
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				if (chunk[2][chunkY + y][x][z] == 0) continue; // don't send air lol
				blocksToSend.push([chunk[2][chunkY + y][x][z], x & 0xf, z & 0xf, chunkY + y]);
			}
		}
	}
	
	const writer = new bufferStuff.Writer();
	writer.writeByte(0x34);
	writer.writeInt(chunk[0]);
	writer.writeInt(chunk[1]);
	writer.writeShort(blocksToSend.length);
	// Block coords
	for (let blocks of blocksToSend) {
		writer.writeShort((blocks[1] << 12 | blocks[2] << 8 | blocks[3]) - 32768);
	}
	// Block types
	for (let blocks of blocksToSend) {
		writer.writeByte(blocks[0]);
	}
	// Block metadata
	for (let blocks of blocksToSend) {
		writer.writeByte(0);
	}

	//user.chunksToSend.add(writer.buffer) // so we don't flood the client queue these
	//parentPort.postMessage(writer.buffer);
	return writer.buffer;
}