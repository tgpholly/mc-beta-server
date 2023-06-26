import { World } from "../World";
import { ItemStack } from "../containers/ItemStack";
import { Entity } from "./Entity";

export class EntityItem extends Entity {
	public age:number;
	public itemStack:ItemStack;

	public constructor(world:World, x:number, y:number, z:number, itemStack:ItemStack) {
		super(world);
		this.x = x;
		this.y = y;
		this.z = z;

		this.itemStack = itemStack;

		this.age = 0;
		this.health = 5;
	}
}