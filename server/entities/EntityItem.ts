import { World } from "../World";
import { ItemStack } from "../inventories/ItemStack";
import { Entity } from "./Entity";

export class EntityItem extends Entity {
	public age:number;
	public itemStack:ItemStack;

	public constructor(world:World, itemStack:ItemStack) {
		super(world);

		this.itemStack = itemStack;

		this.age = 0;
		this.health = 5;
	}
}