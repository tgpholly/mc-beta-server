import { Block } from "../blocks/Block";
import { Item } from "../items/Item";

export class ItemStack {
	public readonly itemID:number;
	public stackSize:number;
	public damage:number;

	public constructor(blockOrItemOrItemID:Block|Item|number, stackSize?:number, damage?:number) {
		if (blockOrItemOrItemID instanceof Block && stackSize === undefined && damage === undefined) {
			this.itemID = blockOrItemOrItemID.blockId;
			this.stackSize = 1;
			this.damage = 0;
		} else if (blockOrItemOrItemID instanceof Block && typeof(stackSize) === "number" && damage === undefined) {
			this.itemID = blockOrItemOrItemID.blockId;
			this.stackSize = stackSize;
			this.damage = 0;
		} else if (blockOrItemOrItemID instanceof Block && typeof(stackSize) === "number" && typeof(damage) === "number") {
			this.itemID = blockOrItemOrItemID.blockId;
			this.stackSize = stackSize;
			this.damage = damage;
		} else if (blockOrItemOrItemID instanceof Item && stackSize === undefined && damage === undefined) {
			this.itemID = blockOrItemOrItemID.shiftedItemID;
			this.stackSize = 1;
			this.damage = 0;
		} else if (blockOrItemOrItemID instanceof Item && typeof(stackSize) === "number" && damage === undefined) {
			this.itemID = blockOrItemOrItemID.shiftedItemID;
			this.stackSize = stackSize;
			this.damage = 0;
		} else if (blockOrItemOrItemID instanceof Item && typeof(stackSize) === "number" && typeof(damage) === "number") {
			this.itemID = blockOrItemOrItemID.shiftedItemID;
			this.stackSize = stackSize;
			this.damage = damage;
		} else if (typeof(blockOrItemOrItemID) === "number" && typeof(stackSize) === "number" && typeof(damage) === "number") {
			this.itemID = blockOrItemOrItemID;
			this.stackSize = stackSize;
			this.damage = damage;
		} else {
			this.itemID = Number.MIN_VALUE;
			this.stackSize = Number.MIN_VALUE;
			this.damage = Number.MIN_VALUE;
		}
	}

	split(amount:number) {
		this.stackSize -= amount;
		return new ItemStack(this.itemID, amount, this.damage);
	}
}