const { perlin2D } = require("./perlin.js");

module.exports = function(cx = 0, cz = 0) {
    // Create bare chunk
    let chunk = {};
	for (let y = 0; y < 128; y++) {
		chunk[y] = {};
		for (let x = 0; x < 16; x++) {
			chunk[y][x] = {};
			for (let z = 0; z < 16; z++) {
				chunk[y][x][z] = 0;
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
			const yCoord = stripTopCoord[x][z] = Math.floor(64 + (perlin2D(((cx << 4) + x) / 15, ((cz << 4) + z) / 15) * 8));
			chunk[yCoord][x][z] = 2;
		}	
	}

	// Generate down from the top layer
	for (let x = 0; x < 16; x++) {
		for (let z = 0; z < 16; z++) {
			// Cache these otherwise we'll be doing more maths 128 times for each column and row
			const topM1 = stripTopCoord[x][z] - 1,
				  topM2 = topM1 - 1;

			for (let y = stripTopCoord[x][z]; y != -1; y--) {
				if (y == topM1 || y == topM2) chunk[y][x][z] = 3;
				else if (y == 0) chunk[y][x][z] = 7;
				else if (y < topM2) chunk[y][x][z] = 1;
			}
		}
	}

	// 2nd pass
	for (let y = 0; y < 128; y++) {
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				if (chunk[y][x][z] == 0 && y < 62) chunk[y][x][z] = 9;

				if (y < 127 && y > 0) if (chunk[y][x][z] == 9 && chunk[y - 1][x][z] == 2) chunk[y - 1][x][z] = 3;
			}
		}
	}

	return chunk;
}