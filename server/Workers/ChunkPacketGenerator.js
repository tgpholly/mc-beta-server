const { Worker, MessageChannel, MessagePort, isMainThread, parentPort } = require('worker_threads');

const bufferStuff = require("../bufferStuff.js");

let chunkY = 0;
let busyInterval = null;

parentPort.on("message", (data) => {
	// This stops the thread from stopping :)
	if (busyInterval == null) busyInterval = setInterval(() => {}, 86400000);

	switch (data[0]) {
		case "chunk":
			chunkY = 0;

			parentPort.postMessage([data[0], doSquareChunk(data[1]), data[2]]);
			chunkY += 16;
			parentPort.postMessage([data[0], doSquareChunk(data[1]), data[2]]);
			chunkY += 16;
			parentPort.postMessage([data[0], doSquareChunk(data[1]), data[2]]);
			chunkY += 16;
			parentPort.postMessage([data[0], doSquareChunk(data[1]), data[2]]);
			chunkY += 16;
			parentPort.postMessage([data[0], doSquareChunk(data[1]), data[2]]);
			chunkY += 16;
			parentPort.postMessage([data[0], doSquareChunk(data[1]), data[2]]);
			chunkY += 16;
			parentPort.postMessage([data[0], doSquareChunk(data[1]), data[2]]);
			chunkY += 16;
			parentPort.postMessage([data[0], doSquareChunk(data[1]), data[2]]);
			
			parentPort.postMessage(["remove", data[3]]);
		break;

		case "generate":
			parentPort.postMessage([data[0], generateChunk(), data[1], data[2], data[3]]);
		break;
	}
});

function generateChunk() {
	let chunk = {};
	for (let y = 0; y < 128; y++) {
		chunk[y] = {};
		for (let x = 0; x < 16; x++) {
			chunk[y][x] = {};
			for (let z = 0; z < 16; z++) {
				if (y == 64) {
					chunk[y][x][z] = 2;
				}
				else if (y == 63 || y == 62) chunk[y][x][z] = 3;
				else if (y == 0) chunk[y][x][z] = 7;
				else if (y < 62) chunk[y][x][z] = 1;
				else chunk[y][x][z] = 0;
			}
		}
	}

	return chunk;
}

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

	// I couldn't figure out how to construct a chunk lmao
	// Using multi block chunks for now
	// TODO: yknow, figure out how to actually chunk.
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

	return writer.buffer;
}