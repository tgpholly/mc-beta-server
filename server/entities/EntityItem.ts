import { World } from "../World";
import { ItemStack } from "../inventories/ItemStack";
import { Entity } from "./Entity";
import { Player } from "./Player";

export class EntityItem extends Entity {
	public age:number;
	public itemStack:ItemStack;

	public pickupDelay:number;

	public constructor(world:World, itemStack:ItemStack) {
		super(world);

		this.itemStack = itemStack;

		this.entitySize.set(0.2, 0.2);

		this.pickupDelay = 0;

		this.motion.set(Math.random() * 0.2 - 0.1, 0.2, Math.random() * 0.2 - 0.1);

		this.age = 0;
		this.health = 5;
	}

	onTick() {
		super.onTick();
		if (this.pickupDelay > 0) {
			this.pickupDelay--;
		} else {
			let playerCollided;
			if (playerCollided = this.collidesWithPlayer(this.entityAABB)) {
				playerCollided.inventory.addItemStack(this.itemStack);
				playerCollided.itemPickup(this, this.itemStack.size);
				if (this.itemStack.size <= 0) {
					this.kill();
				}
			}
		}

		this.motion.add(0, -0.04, 0);
		this.moveEntity(this.motion.x, this.motion.y, this.motion.z);

		let xyMult = 0.98;
		if (this.onGround) {
			xyMult = 0.59;
		}

		// TODO: Change the x and z based on the slipperiness of a block
		this.motion.mult(xyMult, 0.98, xyMult);

		if (this.onGround) {
			this.motion.y *= -0.5;
		}

		this.age++;
		if (this.age >= 6000) {
			this.kill();
		}
	}
}