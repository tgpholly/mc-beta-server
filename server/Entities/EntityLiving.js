/*
	==========- EntityLiving.js -===========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Entity = require("./Entity.js");

class EntityLiving extends Entity {
	constructor(EID = 0, x = 0, y = 0, z = 0) {
		super(EID, x, y, z);

		
	}

	onTick() {
		super.onTick();
	}
}

module.exports = EntityLiving;