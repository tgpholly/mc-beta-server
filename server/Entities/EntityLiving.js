const Entity = require("./Entity.js");

class EntityPlayer extends Entity {
	constructor(x = 0, y = 0, z = 0) {
		super(x, y, z);

		
	}

	onTick() {
		super.onTick();
	}
}

module.exports = EntityPlayer;