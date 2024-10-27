import MaxUses from "../enums/MaxUses";

export default class Item {
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
	static flintAndSteel = new Item(3).setName("Flint and Steel");
	static apple = new Item(4).setName("Apple");
	static bow = new Item(5).setName("Bow");
	static arrow = new Item(6).setName("Arrow");
	static coal = new Item(7).setName("Coal");
	static diamond = new Item(8).setName("Diamond");
	static iron = new Item(9).setName("Iron Ingot");
	static gold = new Item(10).setName("Gold Ingot");
	static ironSword = new Item(11).setMaxDamage(MaxUses.IRON).setName("Iron Sword");
	static woodenSword = new Item(12).setMaxDamage(MaxUses.WOOD).setName("Wooden Sword");
	static woodenShovel = new Item(13).setMaxDamage(MaxUses.WOOD).setName("Wooden Shovel");
	static woodenPickaxe = new Item(14).setMaxDamage(MaxUses.WOOD).setName("Wooden Pickaxe");
	static woodenAxe = new Item(15).setMaxDamage(MaxUses.WOOD).setName("Wooden Axe");

	static clay = new Item(81).setName("Clay");
}