import { World } from "../World";
import { IBlockBehaviour } from "./IBlockBehaviour";

export class BlockBehaviour implements IBlockBehaviour {
	public neighborBlockChange(world:World, x:number, y:number, z:number, blockId:number) {}
	public droppedItem(blockId:number) { return blockId; }
}