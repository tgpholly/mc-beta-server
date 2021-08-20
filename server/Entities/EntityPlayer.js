const EntityLiving = require("./EntityLiving.js");

class EntityPlayer extends EntityLiving {
	constructor(EID = 0, x = 0, y = 0, z = 0) {
		super(EID, x, y, z);

		
	}
}

module.exports = EntityPlayer;