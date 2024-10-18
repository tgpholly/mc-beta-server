import AABB from "../AABB";
import Random from "../Random";
import { World } from "../World";
import { Block } from "./Block";
import { IBlockBehaviour } from "./IBlockBehaviour";

export class BlockBehaviour implements IBlockBehaviour {
	public block!:Block;

	public neighborBlockChange(world:World, x:number, y:number, z:number, blockId:number) {}
	public droppedItem(blockId:number) { return blockId; }
	public droppedCount(blockId:number) { return 1; }
	public getBoundingBox(x:number, y:number, z:number) { return AABB.getAABB(0 + x, 0 + y, 0 + z, 1 + x, 1 + y, 1 + z); }
	public randomTick(world:World, x:number, y:number, z:number, random:Random) {}
	public canPlaceBlockAt(world:World, x:number, y:number, z:number) { return true; }
}