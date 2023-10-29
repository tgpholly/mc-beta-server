import { Block } from "../blocks/Block";
import { Item } from "../items/Item";

export class ItemStack {
	public readonly itemID:number;
	public size:number;
	public damage:number;

	public constructor(blockOrItemOrItemID:Block|Item|number, size?:number, damage?:number) {
		if (blockOrItemOrItemID instanceof Block && size === undefined && damage === undefined) {
			this.itemID = blockOrItemOrItemID.blockId;
			this.size = 1;
			this.damage = 0;
		} else if (blockOrItemOrItemID instanceof Block && typeof(size) === "number" && damage === undefined) {
			this.itemID = blockOrItemOrItemID.blockId;
			this.size = size;
			this.damage = 0;
		} else if (blockOrItemOrItemID instanceof Block && typeof(size) === "number" && typeof(damage) === "number") {
			this.itemID = blockOrItemOrItemID.blockId;
			this.size = size;
			this.damage = damage;
		} else if (blockOrItemOrItemID instanceof Item && size === undefined && damage === undefined) {
			this.itemID = blockOrItemOrItemID.shiftedItemID;
			this.size = 1;
			this.damage = 0;
		} else if (blockOrItemOrItemID instanceof Item && typeof(size) === "number" && damage === undefined) {
			this.itemID = blockOrItemOrItemID.shiftedItemID;
			this.size = size;
			this.damage = 0;
		} else if (blockOrItemOrItemID instanceof Item && typeof(size) === "number" && typeof(damage) === "number") {
			this.itemID = blockOrItemOrItemID.shiftedItemID;
			this.size = size;
			this.damage = damage;
		} else if (typeof(blockOrItemOrItemID) === "number" && typeof(size) === "number" && typeof(damage) === "number") {
			this.itemID = blockOrItemOrItemID;
			this.size = size;
			this.damage = damage;
		} else {
			throw new Error(`ItemStack created with invalid properties (${typeof(blockOrItemOrItemID)}, ${typeof(size)}, ${typeof(damage)})`);
		}
	}

	split(amount:number) {
		this.size -= amount;
		return new ItemStack(this.itemID, amount, this.damage);
	}
}