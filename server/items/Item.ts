export class Item {
	public static items:Array<Item> = new Array<Item>();

	public maxStackSize:number;
	public shiftedItemID:number;
	public name:string;

	public constructor(itemID:number) {
		this.shiftedItemID = 256 + itemID;
		this.maxStackSize = 64;
		this.name = "UNNAMED";

		Item.items[itemID] = this;
	}

	public static getByShiftedItemId(shiftedItemID:number) {
		return Item.items[shiftedItemID - 256];
	}

	public setMaxStackSize(stackSize:number) {
		this.maxStackSize = stackSize;
		return this;
	}

	public setName(name:string) {
		this.name = name;

		return this;
	}

	public getName() {
		return this.name;
	}

	// Define statics here
	static ironShovel = new Item(0).setName("Iron Shovel");
	static ironPickaxe = new Item(1).setName("Iron Pickaxe");
	static ironAxe = new Item(2).setName("Iron Axe");
	static ironSword = new Item(11).setName("Iron Sword");
}