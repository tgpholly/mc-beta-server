const nibbleArray = require("./nibbleArray.js");

module.exports = class {
	constructor(xPos = 0, zPos = 0) {
		this.xPos = xPos;
		this.zPos = zPos;

		this.blocks = Buffer.alloc(256 * 128);

		this.data = new nibbleArray(this.blocks.length, 7);

		this.skylightMap = new nibbleArray(this.blocks.length, 7);

		this.blocklightMap = new nibbleArray(this.blocks.length, 7);
	}

	getChunkData(xPos, yPos, zPos, l, i1, j1) {
		let abyte0 = Buffer.alloc((l * i1 * j1 * 5) / 2);
		let k1 = xPos >> 4;
		let l1 = zPos >> 4;
		let i2 = (xPos + l) - 1 >> 4;
		let j2 = (zPos + j1) - 1 >> 4;
		let k2 = 0;
		let l2 = yPos;
		let i3 = yPos + i1;
		if(l2 < 0)
		{
			l2 = 0;
		}
		if(i3 > 128)
		{
			i3 = 128;
		}
		for(let j3 = k1; j3 <= i2; j3++)
		{
			let k3 = xPos - j3 * 16;
			let l3 = (xPos + l) - j3 * 16;
			if(k3 < 0)
			{
				k3 = 0;
			}
			if(l3 > 16)
			{
				l3 = 16;
			}
			for(let i4 = l1; i4 <= j2; i4++)
			{
				let j4 = zPos - i4 * 16;
				let k4 = (zPos + j1) - i4 * 16;
				if(j4 < 0)
				{
					j4 = 0;
				}
				if(k4 > 16)
				{
					k4 = 16;
				}
				k2 = 1;//getChunkFromChunkCoords(j3, i4).getChunkData(abyte0, k3, l2, j4, l3, i3, k4, k2);
			}
	
		}
	
		return abyte0;
	}


}