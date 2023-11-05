import { MaxUses } from "../enums/MaxUses";

export class Item {
	public static items:Array<Item> = new Array<Item>();

	public maxStackSize:number;
	public maxDamage:number;
	public shiftedItemID:number;
	public name:string;

	public constructor(itemID:number) {
		this.shiftedItemID = 256 + itemID;
		this.maxDamage = 0;
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

	public getMaxDamage() {
		return this.maxDamage;
	}

	public setMaxDamage(value:number) {
		this.maxDamage = value;

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
	static ironShovel = new Item(0).setMaxDamage(MaxUses.IRON).setName("Iron Shovel");
	static ironPickaxe = new Item(1).setMaxDamage(MaxUses.IRON).setName("Iron Pickaxe");
	static ironAxe = new Item(2).setMaxDamage(MaxUses.IRON).setName("Iron Axe");
	static ironSword = new Item(11).setMaxDamage(MaxUses.IRON).setName("Iron Sword");
}