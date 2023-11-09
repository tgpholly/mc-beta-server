import AABB from "../AABB";
import { World } from "../World";
import { IBlockBehaviour } from "./IBlockBehaviour";

export class BlockBehaviour implements IBlockBehaviour {
	public neighborBlockChange(world:World, x:number, y:number, z:number, blockId:number) {}
	public droppedItem(blockId:number) { return blockId; }
	public getBoundingBox(x:number, y:number, z:number) { return AABB.getAABB(0 + x, 0 + y, 0 + z, 1 + x, 1 + y, 1 + z); }
}