const Block = require("../Blocks/Block.js");

module.exports = function(x = 0, z = 0) {
    // Create chunk
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

    for (let y = 0; y < 128; y++) {
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				if (y == 64) {
					chunk[y][x][z] = 2;
				}
				else if (y == 63 || y == 62) chunk[y][x][z][0] = Block.dirt.blockID;
				else if (y == 0) chunk[y][x][z][0] = Block.bedrock.blockID;
				else if (y < 62) chunk[y][x][z][0] = Block.stone.blockID;
				else chunk[y][x][z][0] = 0;
			}
		}
	}

	return chunk;
}