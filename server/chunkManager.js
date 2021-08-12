module.exports = class {
	constructor() {
		this.chunks = {};

		this.createChunk(0, 0);
	}

	createChunk(x = 0, z = 0) {
		this.chunks[x] = {};
		this.chunks[x][z] = {};

		const chunk = this.chunks[x][z];
		for (let y = 0; y < 128; y++) {
			chunk[y] = {};
			for (let x = 0; x < 16; x++) {
				chunk[y][x] = {};
				for (let z = 0; z < 16; z++) {
					chunk[y][x][z] = 0;
				}
			}
		}

		console.log(chunk);
	}
}