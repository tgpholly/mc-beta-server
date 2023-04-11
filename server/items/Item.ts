export class Item {
	public maxStackSize:number;
	public shiftedItemID:number;

	public constructor(itemID:number) {
		this.shiftedItemID = 256 + itemID;
		this.maxStackSize = 64;
	}

	public setMaxStackSize(stackSize:number) {
		this.maxStackSize = stackSize;
		return this;
	}

	// Define statics here
}