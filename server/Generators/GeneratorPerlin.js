const { perlin2D } = require("./perlin.js");

module.exports = function(cx = 0, cz = 0, seed = 0) {
    // Create bare chunk
    let chunk = {};
	for (let y = 0; y < 128; y++) {
		chunk[y] = {};
		for (let x = 0; x < 16; x++) {
			chunk[y][x] = {};
			for (let z = 0; z < 16; z++) {
				chunk[y][x][z] = [0, 0];
			}
		}
	}

	let stripTopCoord = {};
	// History has shown it's better to alloc all at once
	for (let x = 0; x < 16; x++) {
		stripTopCoord[x] = {};
		for (let z = 0; z < 16; z++) {
			stripTopCoord[x][z] = 0;
		}
	}

	// Generate top layer of grass
	for (let x = 0; x < 16; x++) {
		for (let z = 0; z < 16; z++) {
			// NOTE: Because of the way this is, it is not random at all. The heightmap is simply offset so uhhh.
			// TODO: Figure out a better way of dealing with this :)
			const layer1 = (64 + (perlin2D(((cx << 4) + x) / 15, ((cz << 4) + z) / 15) * 10));
			const layer2 = (64 + (perlin2D(((cx + (10 + seed) << 4) + x) / 15, ((cz + (4 + seed) << 4) + z) / 15) * 10));
			const layer3_1 = (64 + (perlin2D(((cx + (-15 + seed) << 4) + x) / 15, ((cz + (-2 + seed) << 4) + z) / 15) * 23));
			const layer3_2 = (64 + (perlin2D(((cx + (25 + seed) << 4) + x) / 15, ((cz + (-17 + seed) << 4) + z) / 15) * 40));
			const layer3 = (layer3_1 + layer3_2) / 2;
			const average = Math.floor((layer1 + layer2 + layer3) / 3);
			stripTopCoord[x][z] = average;
			chunk[average][x][z][0] = 2;
		}	
	}

	// Generate down from the top layer
	for (let x = 0; x < 16; x++) {
		for (let z = 0; z < 16; z++) {
			// Cache these otherwise we'll be doing more maths 128 times for each column and row
			const topM1 = stripTopCoord[x][z] - 1,
				  topM2 = topM1 - 1;

			for (let y = stripTopCoord[x][z]; y != -1; y--) {
				if (y == topM1 || y == topM2) chunk[y][x][z][0] = 3;
				else if (y == 0) chunk[y][x][z][0] = 7;
				else if (y < topM2) chunk[y][x][z][0] = 1;
			}
		}
	}

	// 2nd pass
	for (let y = 0; y < 128; y++) {
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				if (chunk[y][x][z][0] == 0 && y < 64) chunk[y][x][z][0] = 9;

				if (y < 127 && y > 0) if (chunk[y][x][z][0] == 9 && chunk[y - 1][x][z][0] == 2) chunk[y - 1][x][z][0] = 3;

				//if (x == 0 && z == 0) chunk[y][x][z] = 57;
			}
		}
	}

	let treeBlocks = [];

	const chunkX = cx << 4;
	const chunkZ = cz << 4;
	// 3rd pass???
	for (let x = 0; x < 16; x++) {
		for (let z = 0; z < 16; z++) {
			const topBlock = stripTopCoord[x][z];

			if (chunk[topBlock][x][z][0] == 2 && Math.floor(Math.random() * 5) == 0) {
				chunk[topBlock + 1][x][z][0] = 31;
				chunk[topBlock + 1][x][z][1] = 1;
			}

			// Need a better way of doing this it currently takes a severely long time (gee I wonder why)
			if (chunk[topBlock][x][z][0] == 2 && Math.floor(Math.random() * 200) == 0) {
				chunk[topBlock][x][z][0] = 3;
				// Logs
				treeBlocks.push([(chunkX + x), topBlock + 1, (chunkZ + z), 17]);
				treeBlocks.push([(chunkX + x), topBlock + 2, (chunkZ + z), 17]);
				treeBlocks.push([(chunkX + x), topBlock + 3, (chunkZ + z), 17]);
				treeBlocks.push([(chunkX + x), topBlock + 4, (chunkZ + z), 17]);
				treeBlocks.push([(chunkX + x), topBlock + 5, (chunkZ + z), 17]);

				// Leaves
				// Layer 1
				treeBlocks.push([(chunkX + x) - 1, topBlock + 3, (chunkZ + z), 18]);
				treeBlocks.push([(chunkX + x) - 2, topBlock + 3, (chunkZ + z), 18]);
				treeBlocks.push([(chunkX + x) + 1, topBlock + 3, (chunkZ + z), 18]);
				treeBlocks.push([(chunkX + x) + 2, topBlock + 3, (chunkZ + z), 18]);

				treeBlocks.push([(chunkX + x), topBlock + 3, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x), topBlock + 3, (chunkZ + z) - 2, 18]);
				treeBlocks.push([(chunkX + x), topBlock + 3, (chunkZ + z) + 1, 18]);
				treeBlocks.push([(chunkX + x), topBlock + 3, (chunkZ + z) + 2, 18]);

				treeBlocks.push([(chunkX + x) + 1, topBlock + 3, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x) + 1, topBlock + 3, (chunkZ + z) - 2, 18]);
				treeBlocks.push([(chunkX + x) + 1, topBlock + 3, (chunkZ + z) + 1, 18]);
				treeBlocks.push([(chunkX + x) + 1, topBlock + 3, (chunkZ + z) + 2, 18]);

				treeBlocks.push([(chunkX + x) + 2, topBlock + 3, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x) + 2, topBlock + 3, (chunkZ + z) - 2, 18]);
				treeBlocks.push([(chunkX + x) + 2, topBlock + 3, (chunkZ + z) + 1, 18]);
				treeBlocks.push([(chunkX + x) + 2, topBlock + 3, (chunkZ + z) + 2, 18]);

				treeBlocks.push([(chunkX + x) - 1, topBlock + 3, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x) - 1, topBlock + 3, (chunkZ + z) - 2, 18]);
				treeBlocks.push([(chunkX + x) - 1, topBlock + 3, (chunkZ + z) + 1, 18]);
				treeBlocks.push([(chunkX + x) - 1, topBlock + 3, (chunkZ + z) + 2, 18]);

				treeBlocks.push([(chunkX + x) - 2, topBlock + 3, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x) - 2, topBlock + 3, (chunkZ + z) - 2, 18]);
				treeBlocks.push([(chunkX + x) - 2, topBlock + 3, (chunkZ + z) + 1, 18]);
				treeBlocks.push([(chunkX + x) - 2, topBlock + 3, (chunkZ + z) + 2, 18]);

				// Layer 2
				treeBlocks.push([(chunkX + x) - 1, topBlock + 4, (chunkZ + z), 18]);
				treeBlocks.push([(chunkX + x) - 2, topBlock + 4, (chunkZ + z), 18]);
				treeBlocks.push([(chunkX + x) + 1, topBlock + 4, (chunkZ + z), 18]);
				treeBlocks.push([(chunkX + x) + 2, topBlock + 4, (chunkZ + z), 18]);

				treeBlocks.push([(chunkX + x), topBlock + 4, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x), topBlock + 4, (chunkZ + z) - 2, 18]);
				treeBlocks.push([(chunkX + x), topBlock + 4, (chunkZ + z) + 1, 18]);
				treeBlocks.push([(chunkX + x), topBlock + 4, (chunkZ + z) + 2, 18]);

				treeBlocks.push([(chunkX + x) + 1, topBlock + 4, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x) + 1, topBlock + 4, (chunkZ + z) - 2, 18]);
				treeBlocks.push([(chunkX + x) + 1, topBlock + 4, (chunkZ + z) + 1, 18]);
				treeBlocks.push([(chunkX + x) + 1, topBlock + 4, (chunkZ + z) + 2, 18]);

				treeBlocks.push([(chunkX + x) + 2, topBlock + 4, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x) + 2, topBlock + 4, (chunkZ + z) - 2, 18]);
				treeBlocks.push([(chunkX + x) + 2, topBlock + 4, (chunkZ + z) + 1, 18]);
				treeBlocks.push([(chunkX + x) + 2, topBlock + 4, (chunkZ + z) + 2, 18]);

				treeBlocks.push([(chunkX + x) - 1, topBlock + 4, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x) - 1, topBlock + 4, (chunkZ + z) - 2, 18]);
				treeBlocks.push([(chunkX + x) - 1, topBlock + 4, (chunkZ + z) + 1, 18]);
				treeBlocks.push([(chunkX + x) - 1, topBlock + 4, (chunkZ + z) + 2, 18]);

				treeBlocks.push([(chunkX + x) - 2, topBlock + 4, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x) - 2, topBlock + 4, (chunkZ + z) - 2, 18]);
				treeBlocks.push([(chunkX + x) - 2, topBlock + 4, (chunkZ + z) + 1, 18]);
				treeBlocks.push([(chunkX + x) - 2, topBlock + 4, (chunkZ + z) + 2, 18]);

				// Layer 3
				treeBlocks.push([(chunkX + x) - 1, topBlock + 5, (chunkZ + z), 18]);
				treeBlocks.push([(chunkX + x) + 1, topBlock + 5, (chunkZ + z), 18]);
				treeBlocks.push([(chunkX + x), topBlock + 5, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x), topBlock + 5, (chunkZ + z) + 1, 18]);

				treeBlocks.push([(chunkX + x) - 1, topBlock + 5, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x) + 1, topBlock + 5, (chunkZ + z) + 1, 18]);
				treeBlocks.push([(chunkX + x) - 1, topBlock + 5, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x) + 1, topBlock + 5, (chunkZ + z) + 1, 18]);
				treeBlocks.push([(chunkX + x) + 1, topBlock + 5, (chunkZ + z) - 1, 18]);

				// Layer 4
				treeBlocks.push([(chunkX + x) - 1, topBlock + 6, (chunkZ + z), 18]);
				treeBlocks.push([(chunkX + x) + 1, topBlock + 6, (chunkZ + z), 18]);
				treeBlocks.push([(chunkX + x), topBlock + 6, (chunkZ + z) - 1, 18]);
				treeBlocks.push([(chunkX + x), topBlock + 6, (chunkZ + z) + 1, 18]);
				treeBlocks.push([(chunkX + x), topBlock + 6, (chunkZ + z), 18]);
			}
		}
	}

	return [chunk, treeBlocks];
}