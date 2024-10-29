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
	static stoneSword = new Item(16).setMaxDamage(MaxUses.STONE).setName("Stone Sword");
	static stoneShovel = new Item(17).setMaxDamage(MaxUses.STONE).setName("Stone Shovel");
	static stonePickaxe = new Item(18).setMaxDamage(MaxUses.STONE).setName("Stone Pickaxe");
	static stoneAxe = new Item(19).setMaxDamage(MaxUses.STONE).setName("Stone Axe");
	static diamondSword = new Item(20).setMaxDamage(MaxUses.DIAMOND).setName("Diamond Sword");
	static diamondShovel = new Item(21).setMaxDamage(MaxUses.DIAMOND).setName("Diamond Shovel");
	static diamondPickaxe = new Item(22).setMaxDamage(MaxUses.DIAMOND).setName("Diamond Pickaxe");
	static diamondAxe = new Item(23).setMaxDamage(MaxUses.DIAMOND).setName("Diamond Axe");
	static stick = new Item(24).setName("Stick");
	static bowl = new Item(25).setName("Bowl");
	static mushroomStew = new Item(26).setName("Mushroom Stew");
	static goldSword = new Item(27).setMaxDamage(MaxUses.GOLD).setName("Gold Sword");
	static goldShovel = new Item(28).setMaxDamage(MaxUses.GOLD).setName("Gold Shovel");
	static goldPickaxe = new Item(29).setMaxDamage(MaxUses.GOLD).setName("Gold Pickaxe");
	static goldAxe = new Item(30).setMaxDamage(MaxUses.GOLD).setName("Gold Axe");
	static string = new Item(31).setName("String");
	static feather = new Item(32).setName("Feather");
	static gunpowder = new Item(33).setName("Gunpowder");
	static woodenHoe = new Item(34).setMaxDamage(MaxUses.WOOD).setName("Wooden Hoe");
	static stoneHoe = new Item(35).setMaxDamage(MaxUses.WOOD).setName("Stone Hoe");
	static ironHoe = new Item(36).setMaxDamage(MaxUses.WOOD).setName("Iron Hoe");
	static diamondHoe = new Item(37).setMaxDamage(MaxUses.WOOD).setName("Diamond Hoe");
	static goldHoe = new Item(38).setMaxDamage(MaxUses.WOOD).setName("Gold Hoe");
	static seeds = new Item(39).setName("Seeds");
	static wheat = new Item(40).setName("Wheat");
	static bread = new Item(41).setName("Bread");
	// TODO: Armor items
	static flint = new Item(62).setName("Flint");
	static rawPorkchop = new Item(63).setName("Raw Porkchop");
	static cookedPorkchop = new Item(64).setName("Cooked Porkchop");
	static painting = new Item(65).setName("Painting");
	static goldenApple = new Item(66).setName("Golden Apple");
	static sign = new Item(67).setName("Sign");
	static woodenDoor = new Item(68).setName("Wooden Door");
	static bucket = new Item(69).setName("Bucket");
	static waterBucket = new Item(70).setName("Water Bucket");
	static lavaBucket = new Item(71).setName("Lava Bucket");
	static minecart = new Item(72).setName("Minecart");
	static saddle = new Item(73).setName("Saddle");
	static ironDoor = new Item(74).setName("Iron Door");
	static redstone = new Item(75).setName("Redstone");
	static snowball = new Item(76).setName("Snowball");
	static boat = new Item(77).setName("Boat");
	static leather = new Item(78).setName("Leather");
	static milkBucket = new Item(79).setName("Milk Bucket");
	static brick = new Item(80).setName("Brick");
	static clay = new Item(81).setName("Clay");
	static sugarcane = new Item(82).setName("Sugar Cane");
	static paper = new Item(83).setName("Paper");
	static book = new Item(84).setName("Book");
	static slimeBall = new Item(85).setName("Slime Ball");
	static minecartChest = new Item(86).setName("Minecart with Chest");
	static minecartFurnace = new Item(87).setName("Minecart with Furnace");
	static egg = new Item(88).setName("Egg");
	static compass = new Item(89).setName("Compass");
	static fishingRod = new Item(90).setName("Fishing Rod");
	static clock = new Item(91).setName("Clock");
	static glowstoneDust = new Item(92).setName("Glowstone Dust");
	static rawFish = new Item(93).setName("Raw Fish");
	static cookedFish = new Item(94).setName("Cooked Fish");
	static dye = new Item(95).setName("Dye");
	static bone = new Item(96).setName("Bone");
	static sugar = new Item(97).setName("Sugar");
	static cake = new Item(98).setName("Cake");
	static bed = new Item(99).setName("Bed");
	static redstoneRepeater = new Item(100).setName("Redstone Repeater");
	static cooking = new Item(101).setName("Cookie");
	static map = new Item(102).setName("Map");
	static shears = new Item(103).setName("Shears");
	static record13 = new Item(2000).setName("13");
	static recordCat = new Item(2001).setName("Cat");
}