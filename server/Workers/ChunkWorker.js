const { parentPort } = require('worker_threads');

const { deflateSync } = require("zlib");

const bufferStuff = require("../bufferStuff.js");

let busyInterval = null;

parentPort.on("message", (data) => {
	// This stops the thread from stopping :)
	if (busyInterval == null) busyInterval = setInterval(() => {}, 86400000); // Runs once a day

	switch (data[0]) {
		case "chunk":
			parentPort.postMessage([data[0], doChunk(data[1]), data[2]]);
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

function doChunk(chunk) {
	const writer = new bufferStuff.Writer();

	writer.writeByte(0x33); // Chunk
	writer.writeInt(chunk[0] << 4); // Chunk X
	writer.writeShort(0 << 7); // Chunk Y
	writer.writeInt(chunk[1] << 4); // Chunk Z
	writer.writeByte(15); // Size X
	writer.writeByte(127); // Size Y
	writer.writeByte(15); // Size Z

	// pre-alloc since doing an alloc 98,304 times takes a while yknow.
	const blocks = new bufferStuff.Writer(32768);
	const metadata = new bufferStuff.Writer(32768);
	const lighting = new bufferStuff.Writer(32768);

	let blockMeta = false;
	for (let x = 0; x < 16; x++) {
		for (let z = 0; z < 16; z++) {
			for (let y = 0; y < 128; y++) {
				blocks.writeByte(chunk[2][y][x][z]); // The block
				if (blockMeta) {
					metadata.writeByte(0x00); // TODO: Metadata
					// Light level 15 for 2 blocks (1111 1111)
					lighting.writeUByte(0xFF); // TODO: Lighting (Client seems to do it's own so it's not top priority)
				}
				// Hack for nibble stuff
				blockMeta = !blockMeta;
			}
		}
	}
	// These are hacks for the nibbles
	blocks.writeBuffer(metadata.buffer);
	blocks.writeBuffer(lighting.buffer); // Block lighting
	//blocks.writeBuffer(lighting.buffer); // Sky lighting (Looks like this isn't needed???)

	// We're on another thread we don't care if we halt
	const deflated = deflateSync(blocks.buffer);
	writer.writeInt(deflated.length); // Compressed Size
	writer.writeBuffer(deflated); // Compressed chunk data

	return writer.buffer;
}