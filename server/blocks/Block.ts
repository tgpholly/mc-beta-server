import AABB from "../AABB";
import { World } from "../World";
import { BlockBehaviourSapling } from "./BlockBehaviorSapling";
import { BlockBehaviour } from "./BlockBehaviour";
import { BlockBehaviourClay } from "./BlockBehaviourClay";
import { BlockBehaviourFlower } from "./BlockBehaviourFlower";
import { BlockBehaviourGrass } from "./BlockBehaviourGrass";
import BlockBehaviourOre from "./BlockBehaviourOre";
import BlockBehaviourRedstoneOre from "./BlockBehaviourRedstoneOre";
import { BlockBehaviourStone } from "./BlockBehaviourStone";
import { BlockBehaviourTallGrass } from "./BlockBehaviourTallGrass";
import { IBlockBehaviour } from "./IBlockBehaviour";

abstract class Behaviour {
	public static base = new BlockBehaviour();

	public static stone = new BlockBehaviourStone();
	public static grass = new BlockBehaviourGrass();
	public static sapling = new BlockBehaviourSapling();
	public static ore = new BlockBehaviourOre();

	public static tallGrass = new BlockBehaviourTallGrass();
	public static flower = new BlockBehaviourFlower();

	public static redstoneOre = new BlockBehaviourRedstoneOre();

	public static clay = new BlockBehaviourClay();
}

export class Block {
	public readonly blockId:number;
	
	public static readonly blocks:Array<Block> = new Array<Block>();
	public static readonly lightPassage:Array<number> = new Array<number>();
	public static readonly lightEmission:Array<number> = new Array<number>();
	public static readonly hardness:Array<number> = new Array<number>();
	public static readonly blockAABBs:Array<AABB> = new Array<AABB>();
	public static readonly blockBehaviours:Array<IBlockBehaviour> = new Array<IBlockBehaviour>();
	public static readonly blockNames:Array<string> = new Array<string>();

	public constructor(blockId:number) {
		Block.blocks[blockId] = this;
		Block.lightPassage[blockId] = 0;
		Block.lightEmission[blockId] = 0;
		Block.blockNames[blockId] = "";
		Block.blockBehaviours[blockId] = Behaviour.base;
		this.blockId = blockId;
	}

	public get lightPassage() {
		return Block.lightPassage[this.blockId];
	}

	public set lightPassage(value:number) {
		Block.lightPassage[this.blockId] = value;
	}

	public get lightEmission() {
		return Block.lightEmission[this.blockId];
	}

	public set lightEmission(value:number) {
		Block.lightEmission[this.blockId] = value;
	}

	public get hardness() {
		return Block.hardness[this.blockId];
	}

	public set hardness(value:number) {
		Block.hardness[this.blockId] = value;
	}

	private get blockAABB() {
		return Block.blockAABBs[this.blockId];
	}

	private set blockAABB(value:AABB) {
		Block.blockAABBs[this.blockId] = value;
	}

	public get blockName() {
		return Block.blockNames[this.blockId];
	}

	public set blockName(value:string) {
		Block.blockNames[this.blockId] = value;
	}

	public get behaviour() {
		return Block.blockBehaviours[this.blockId];
	}

	public set behaviour(value:IBlockBehaviour) {
		Block.blockBehaviours[this.blockId] = value;
	}

	public setBehaviour(value:IBlockBehaviour) {
		this.behaviour = value;
		return this;
	}

	public setLightPassage(value:number) {
		this.lightPassage = value;
		return this;
	}

	public setLightEmission(value:number) {
		this.lightEmission = value;
		return this;
	}

	public setBlockName(value:string) {
		this.blockName = value;
		return this;
	}

	public neighborBlockChange(world:World, x:number, y:number, z:number, blockId:number) {
		this.behaviour.neighborBlockChange(world, x, y, z, blockId);
	}

	public droppedItem(blockId:number) {
		this.behaviour.droppedItem(blockId);
	}

	public droppedCount(blockId:number) {
		this.behaviour.droppedCount(blockId);
	}

	public getHardness() {
		return this.hardness;
	}

	public setHardness(value:number) {
		this.hardness = value;
		return this;
	}

	public setUnbreakable() {
		return this.setHardness(-1);
	}

	public blockStrength() {
		if (this.hardness < 0) {
			return 0;
		}
		// TODO: Check if we can actually harvest a block with current tool
		// TODO: Have the 1 be based on current tool ig
		return 1 / this.hardness / 100;
	}
	
	public getBoundingBox(x:number, y:number, z:number) {
		return this.behaviour.getBoundingBox(x, y, z);
	}

	// Define statics here
	static readonly stone = new Block(1).setHardness(1.5).setBehaviour(Behaviour.stone).setBlockName("Stone");
	static readonly grass = new Block(2).setHardness(0.6).setBehaviour(Behaviour.grass).setBlockName("Grass");
	static readonly dirt = new Block(3).setHardness(0.5).setBlockName("Dirt");
	static readonly cobblestone = new Block(4).setHardness(2).setBlockName("Cobblestone");
	static readonly planks = new Block(5).setHardness(2).setBlockName("Planks");
	static readonly sapling = new Block(6).setHardness(0).setBehaviour(Behaviour.sapling).setBlockName("Sapling");
	static readonly bedrock = new Block(7).setUnbreakable().setBlockName("Bedrock");
	static readonly waterFlowing = new Block(8).setHardness(100).setLightPassage(128).setBlockName("Flowing Water"); // TODO: Behavior script
	static readonly waterStill = new Block(9).setHardness(100).setLightPassage(255).setBlockName("Still Water"); // TODO: Behavior script
	static readonly lavaFlowing = new Block(10).setHardness(0).setLightPassage(255).setBlockName("Flowing Lava"); // TODO: Behavior script
	static readonly lavaStill = new Block(11).setHardness(100).setBlockName("Still Lava"); // TODO: Behavior script
	static readonly sand = new Block(12).setHardness(0.5).setBlockName("Sand");
	static readonly gravel = new Block(13).setHardness(0.6).setBlockName("Gravel"); // TODO: Behavior script
	static readonly goldOre = new Block(14).setHardness(3).setBehaviour(Behaviour.ore).setBlockName("Gold Ore"); // TODO: Behavior script
	static readonly ironOre = new Block(15).setHardness(3).setBehaviour(Behaviour.ore).setBlockName("Iron Ore"); // TODO: Behavior script
	static readonly coalOre = new Block(16).setHardness(3).setBehaviour(Behaviour.ore).setBlockName("Coal Ore"); // TODO: Behavior script
	static readonly wood = new Block(17).setHardness(2).setBlockName("Wood");
	static readonly leaves = new Block(18).setHardness(0.2).setLightPassage(240).setBlockName("Leaves");
	static readonly sponge = new Block(19).setHardness(0.6).setBlockName("Sponge");
	static readonly glass = new Block(20).setHardness(0.3).setLightPassage(255).setBlockName("Glass"); // TODO: Behavior script
	static readonly lapisOre = new Block(21).setHardness(3).setBehaviour(Behaviour.ore).setBlockName("Lapis Ore"); // TODO: Behavior script
	static readonly lapisBlock = new Block(22).setHardness(3).setBlockName("Lapis Block");
	static readonly dispenser = new Block(23).setHardness(3.5).setBlockName("Dispenser");
	static readonly sandStone = new Block(24).setHardness(0.8).setBlockName("Sand Stone");
	static readonly noteblock = new Block(25).setHardness(0.8).setBlockName("Noteblock");
	static readonly bed = new Block(26).setHardness(0.2).setBlockName("Bed"); // TODO: Behavior script
	static readonly poweredRail = new Block(27).setHardness(0.7).setBlockName("Powered Rail"); // TODO: Behavior script
	static readonly detectorRail = new Block(28).setHardness(0.7).setBlockName("Detector Rail"); // TODO: Behavior script
	static readonly stickyPistonBase = new Block(29).setBlockName("Sticky Piston Base"); // TODO: Behavior script
	static readonly web = new Block(30).setHardness(4).setLightPassage(255).setBlockName("Web"); // TODO: Behavior script
	static readonly tallGrass = new Block(31).setHardness(0).setLightPassage(255).setBehaviour(Behaviour.tallGrass).setBlockName("Tall Grass");
	static readonly deadBush = new Block(32).setHardness(0).setLightPassage(255).setBehaviour(Behaviour.tallGrass).setBlockName("Dead Bush"); // TODO: Give it's own behavior script
	static readonly pistonBase = new Block(33).setBlockName("Piston Base"); // TODO: Behavior script
	static readonly pistonExtension = new Block(34).setBlockName("Piston Extension"); // TODO: Behavior script?
	static readonly wool = new Block(35).setHardness(0.8).setBlockName("Wool"); // TODO: Behavior script?
	static readonly pistonMoving = new Block(36).setBlockName("Piston Move Event Block Why Is This A Block"); // TODO: Behavior script
	static readonly flowerDandelion = new Block(37).setHardness(0).setLightPassage(255).setBehaviour(Behaviour.flower).setBlockName("Dandelion");
	static readonly flowerRose = new Block(38).setHardness(0).setLightPassage(255).setBehaviour(Behaviour.flower).setBlockName("Rose");
	static readonly brownMushroom = new Block(39).setHardness(0).setLightEmission(0.125).setBlockName("Brown Mushroom"); // TODO: Behavior script
	static readonly redMushroom = new Block(40).setHardness(0).setBlockName("Red Mushroom"); // TODO: Behavior script
	static readonly goldBlock = new Block(41).setHardness(3).setBlockName("Gold Block");
	static readonly ironBlock = new Block(42).setHardness(5).setBlockName("Iron Block");
	static readonly doubleSlab = new Block(43).setHardness(2).setBlockName("Slab"); // TODO: Behavior script
	static readonly singleSlab = new Block(44).setHardness(2).setBlockName("Slab"); // TODO: Behavior script
	static readonly brick = new Block(45).setHardness(2).setBlockName("Brick");
	static readonly tnt = new Block(46).setHardness(0).setBlockName("TNT"); // TODO: Behavior script
	static readonly bookshelf = new Block(47).setHardness(1.5).setBlockName("Bookshelf"); // TODO: Behavior script
	static readonly mossyCobblestone = new Block(48).setHardness(2).setBlockName("Mossy Cobblestone");
	static readonly obsidian = new Block(49).setHardness(10).setBlockName("Obsidian"); // TODO: Behavior script?
	static readonly torch = new Block(50).setHardness(0).setLightEmission(0.9).setBlockName("Torch"); // TODO: Behavior script
	static readonly fire = new Block(51).setHardness(0).setLightEmission(1).setBlockName("Fire"); // TODO: Behavior script
	static readonly mobSpawner = new Block(52).setHardness(5).setBlockName("Mob Spawner"); // TODO: Behavior script
	static readonly woodenStairs = new Block(53).setBlockName("Wooden Stairs"); // TODO: Behavior script
	static readonly chest = new Block(54).setHardness(2.5).setBlockName("Chest"); // TODO: Behavior script
	static readonly redstoneDust = new Block(55).setHardness(0).setBlockName("Redstone Dust"); // TODO: Behavior script
	static readonly diamondOre = new Block(56).setHardness(3).setBlockName("Diamond Ore"); // TODO: Behavior script
	static readonly diamondBlock = new Block(57).setHardness(5).setBlockName("Diamond Block"); // TODO: Behavior script
	static readonly craftingTable = new Block(58).setHardness(2.5).setBlockName("Crafting Table"); // TODO: Behavior script
	static readonly wheatCrop = new Block(59).setHardness(0).setBlockName("Wheet Crop"); // TODO: Behavior script
	static readonly farmland = new Block(60).setHardness(0.6).setBlockName("Farmland"); // TODO: Behavior script
	static readonly furnaceIdle = new Block(61).setHardness(3.5).setBlockName("Furnace"); // TODO: Behavior script
	static readonly furnaceActive = new Block(62).setHardness(3.5).setBlockName("Furnace"); // TODO: Behavior script
	static readonly sign = new Block(63).setHardness(1).setBlockName("Sign"); // TODO: Behavior script
	static readonly woodenDoor = new Block(64).setHardness(3).setBlockName("Wooden Door"); // TODO: Behavior script
	static readonly ladder = new Block(65).setHardness(0.4).setBlockName("Ladder"); // TODO: Behavior script
	static readonly rail = new Block(66).setHardness(0.7).setBlockName("Rail"); // TODO: Behavior script
	static readonly cobblestoneStairs = new Block(67).setBlockName("Cobblestone Stairs"); // TODO: Behavior script
	static readonly signWall = new Block(68).setHardness(1).setBlockName("Sign"); // TODO: Behavior script
	static readonly lever = new Block(69).setHardness(0.5).setBlockName("Lever"); // TODO: Behavior script
	static readonly stonePressurePlate = new Block(70).setHardness(0.5).setBlockName("Stone Pressure Plate"); // TODO: Behavior script
	static readonly ironDoor = new Block(71).setHardness(5).setBlockName("Iron Door"); // TODO: Behavior script
	static readonly woodenPressurePlate = new Block(72).setHardness(0.5).setBlockName("Wooden Pressure Plate"); // TODO: Behavior script
	static readonly redstoneOre = new Block(73).setHardness(3).setBehaviour(Behaviour.redstoneOre).setBlockName("Redstone Ore"); // TODO: Behavior script
	static readonly redstoneOreGlowing = new Block(74).setHardness(3).setLightEmission(0.625).setBehaviour(Behaviour.redstoneOre).setBlockName("Redstone Ore"); // TODO: Behavior script
	static readonly redstoneTorchIdle = new Block(75).setHardness(0).setBlockName("Redstone Torch"); // TODO: Behavior script
	static readonly redstoneTorchActive = new Block(76).setHardness(0).setLightEmission(0.5).setBlockName("Redstone Torch"); // TODO: Behavior script
	static readonly button = new Block(77).setHardness(0.5).setBlockName("Button"); // TODO: Behavior script
	static readonly snow = new Block(78).setHardness(0.1).setBlockName("Snow Layer"); // TODO: Behavior script
	static readonly ice = new Block(79).setHardness(0.5).setLightPassage(128).setBlockName("Ice"); // TODO: Behavior script
	static readonly snowBlock = new Block(80).setHardness(0.2).setBlockName("Snow"); // TODO: Behavior script
	static readonly cactus = new Block(81).setHardness(0.4).setBlockName("Cactus"); // TODO: Behavior script
	static readonly clay = new Block(82).setHardness(0.6).setBehaviour(Behaviour.clay).setBlockName("Clay");
	static readonly sugarcane = new Block(83).setHardness(0).setLightPassage(255).setBlockName("Sugar Cane"); // TODO: Behavior script
	static readonly jukebox = new Block(84).setHardness(2).setBlockName("Jukebox"); // TODO: Behavior script
	static readonly fence = new Block(85).setHardness(2).setBlockName("Fence"); // TODO: Behavior script
	static readonly pumpkin = new Block(86).setHardness(1).setBlockName("Pumpkin");
	static readonly netherrack = new Block(87).setHardness(0.4).setBlockName("Netherrack");
	static readonly soulSand = new Block(88).setHardness(0.5).setBlockName("Soul Sand");
	static readonly glowStone = new Block(89).setHardness(0.3).setBlockName("Glowstone"); // TODO: Behavior script
	static readonly netherPortal = new Block(90).setUnbreakable().setLightEmission(0.75).setBlockName("Nether Portal"); // TODO: Behavior script
	static readonly jackOLantern = new Block(91).setHardness(1).setLightEmission(1).setBlockName("Jack O' Lantern");
	static readonly cake = new Block(92).setHardness(0.5).setBlockName("Cake"); // TODO: Behavior script
	static readonly redstoneRepeaterIdle = new Block(93).setHardness(0).setBlockName("Redstone Repeater"); // TODO: Behavior script
	static readonly redstoneRepeaterActive = new Block(94).setHardness(0).setLightEmission(0.625).setBlockName("Redstone Repeater"); // TODO: Behavior script
	static readonly aprilFoolsLockedChest = new Block(95).setHardness(0).setLightEmission(1).setBlockName("Locked Chest");
	static readonly trapdoor = new Block(96).setHardness(3).setBlockName("Trapdoor"); // TODO: Behavior script
}