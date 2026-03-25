import AABB from "../AABB";
import Block from "./Block";
import IBlockBehaviour from "./IBlockBehaviour";
import Random from "../Random";
import World from "../World";

export default class BlockBehaviour implements IBlockBehaviour {
	public block!:Block;

	public placed(_world:World, _x:number, _y:number, _z:number) {}
	public destroyed(_world:World, _x:number, _y:number, _z:number) {}
	public interactable() { return false; }
	public neighborBlockChange(_world:World, _x:number, _y:number, _z:number, _blockId:number) {}
	public droppedItem(blockId:number) { return blockId; }
	public droppedCount(_blockId:number) { return 1; }
	public getBoundingBox(x:number, y:number, z:number) { return AABB.getAABB(0 + x, 0 + y, 0 + z, 1 + x, 1 + y, 1 + z); }
	public randomTick(_world:World, _x:number, _y:number, _z:number, _random:Random) {}
	public canPlaceBlockAt(_world:World, _x:number, _y:number, _z:number) { return true; }
}