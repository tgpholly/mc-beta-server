import { Block } from "../blocks/Block";
import { Item } from "../items/Item";

export class ItemStack {
	public readonly itemID:number;
	public readonly isBlock:boolean;
	public readonly maxSize:number;
	public size:number;
	public damage:number;

	public constructor(blockOrItemOrItemID:Block|Item|number, size?:number, damage?:number) {
		if (blockOrItemOrItemID instanceof Block && size === undefined && damage === undefined) {
			this.itemID = blockOrItemOrItemID.blockId;
			this.size = 0;
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
			this.size = 0;
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
		} else if (typeof(blockOrItemOrItemID) === "number" && typeof(size) === "number" && damage === undefined) {
			this.itemID = blockOrItemOrItemID;
			this.size = size;
			this.damage = 0;
		} else if (typeof(blockOrItemOrItemID) === "number" && size === undefined && damage === undefined) {
			this.itemID = blockOrItemOrItemID;
			this.size = 0;
			this.damage = 0;
		} else {
			throw new Error(`ItemStack created with invalid properties (${typeof(blockOrItemOrItemID)}, ${typeof(size)}, ${typeof(damage)})`);
		}

		this.isBlock = this.itemID < 256;
		this.maxSize = !this.isBlock ? Item.getByShiftedItemId(this.itemID).maxStackSize : 64;
	}

	public insert(itemStack:ItemStack) {
		const remainingSpace = this.spaceAvaliable;
		if (remainingSpace === 0) {
			return;
		}

		if (remainingSpace >= itemStack.size) {
			this.size += itemStack.size;
			itemStack.size = 0;
			return;
		}

		if (remainingSpace < itemStack.size) {
			this.size += remainingSpace;
			itemStack.size -= remainingSpace;
		}
	} 

	public get spaceAvaliable() {
		// Stack size check for Item(s) and Block(s).
		return Math.max(this.maxSize - this.size, 0);
	}

	split(amount:number) {
		this.size -= amount;
		return new ItemStack(this.itemID, amount, this.damage);
	}
}