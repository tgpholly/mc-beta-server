class Entity {
	constructor(EID = 0, x = 0, y = 0, z = 0, yaw = 0, pitch = 0) {
		this.EID = EID;

		this.x = x;
		this.y = y;
		this.z = z;
		this.yaw = yaw;
		this.pitch = pitch;

		this.motionX = 0;
		this.motionY = 0;
		this.motionZ = 0;
	}

	onTick() {
		
	}
}

module.exports = Entity;