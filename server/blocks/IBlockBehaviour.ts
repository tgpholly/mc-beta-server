import AABB from "../AABB";
import Random from "../Random";
import { World } from "../World";
import { Block } from "./Block";

export interface IBlockBehaviour {
	block:Block,

	neighborBlockChange(world:World, x:number, y:number, z:number, blockId:number): void,
	droppedItem: (blockId:number) => number,
	droppedCount: (blockId:number) => number,
	getBoundingBox: (x:number, y:number, z:number) => AABB,
	randomTick: (world:World, x:number, y:number, z:number, random:Random) => void,
	canPlaceBlockAt: (world:World, x:number, y:number, z:number) => boolean
}