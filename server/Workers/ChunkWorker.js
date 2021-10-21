/*
	===========- ChunkWorker.js -===========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const { parentPort } = require('worker_threads'),
	  { deflateSync } = require("zlib");

const GeneratorFlat = require("../Generators/GeneratorFlat.js");
const GeneratorPerlin = require("../Generators/GeneratorPerlin.js");

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
			const startTime = new Date().getTime();
			const chunkData = generateChunk(data[1], data[2], data[4]);
			parentPort.postMessage([data[0], chunkData[0], data[1], data[2], data[3], chunkData[1]]);
			console.log(`Chunk took ${new Date().getTime() - startTime}ms`);
		break;
	}
});

function generateChunk(x = 0, z = 0, seed = 0) {
	return GeneratorPerlin(x, z, seed);
}

function doChunk(chunk) {
	const writer = new bufferStuff.Writer(18);

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
				blocks.writeByte(chunk[2][y][x][z][0]);
				if (blockMeta) {
					metadata.writeNibble(chunk[2][y - 1][x][z][1], chunk[2][y][x][z][1]); // NOTE: This is sorta jank but it does work
					// Light level 15 for 2 blocks (1111 1111)
					lighting.writeNibble(15, 15); // TODO: Lighting (Client seems to do it's own (when a block update happens) so it's not top priority)
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