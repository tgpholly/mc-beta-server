import { World } from "../World";
import { BlockBehaviour } from "./BlockBehaviour";
import { BlockBehaviourFlower } from "./BlockBehaviourFlower";
import { BlockBehaviourGrass } from "./BlockBehaviourGrass";
import { BlockBehaviourStone } from "./BlockBehaviourStone";
import { IBlockBehaviour } from "./IBlockBehaviour";

abstract class Behaviour {
	public static base = new BlockBehaviour();

	public static stone = new BlockBehaviourStone();
	public static grass = new BlockBehaviourGrass();

	public static flower = new BlockBehaviourFlower();
}

export class Block {
	public readonly blockId:number;
	
	public static readonly blocks:Array<Block> = new Array<Block>();
	public static readonly lightPassage:Array<number> = new Array<number>();
	public static readonly blockBehaviours:Array<IBlockBehaviour> = new Array<IBlockBehaviour>();
	public static readonly blockNames:Array<string> = new Array<string>();

	public constructor(blockId:number) {
		Block.blocks[blockId] = this;
		Block.lightPassage[blockId] = 0;
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

	// Define statics here
	static readonly stone = new Block(1).setBehaviour(Behaviour.stone).setBlockName("Stone");
	static readonly grass = new Block(2).setBehaviour(Behaviour.grass).setBlockName("Grass");
	static readonly dirt = new Block(3).setBlockName("Dirt");
	static readonly cobblestone = new Block(4).setBlockName("Cobblestone");

	static readonly bedrock = new Block(7).setBlockName("Bedrock");

	static readonly waterStill = new Block(9).setLightPassage(128).setBlockName("Still Water");

	static readonly lavaStill = new Block(11).setBlockName("Still Lava");

	static readonly sand = new Block(12).setBlockName("Sand");
	static readonly gravel = new Block(13).setBlockName("Gravel");

	static readonly wood = new Block(17).setBlockName("Wood");
	static readonly leaves = new Block(18).setLightPassage(240).setBlockName("Leaves");

	static readonly glass = new Block(20).setLightPassage(255).setBlockName("Glass");

	static readonly tallGrass = new Block(31).setLightPassage(255).setBehaviour(Behaviour.flower).setBlockName("Tall Grass");

	static readonly flowerDandelion = new Block(37).setLightPassage(255).setBlockName("Dandelion");
	static readonly flowerRose = new Block(38).setLightPassage(255).setBlockName("Rose");

	static readonly clay = new Block(82).setBlockName("Clay");

	static readonly netherrack = new Block(87).setBlockName("Netherrack");
}