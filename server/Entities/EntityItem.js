/*
	============- EntityItem.js -===========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Entity = require("./Entity.js");

class EntityItem extends Entity {
	constructor(itemStack, x = 0, y = 0, z = 0) {
		super(global.fromIDPool(), x, y, z);

		this.itemStack = itemStack;

		this.motionX = (Math.random() * 0.2 - 0.1);
        this.motionY = 0.2;
        this.motionZ = (Math.random() * 0.2 - 0.1);
	}
}