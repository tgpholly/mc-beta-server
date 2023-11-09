import AABB from "../AABB";
import { World } from "../World";

export interface IBlockBehaviour {
	neighborBlockChange(world:World, x:number, y:number, z:number, blockId:number): void,
	droppedItem: (blockId:number) => number,
	getBoundingBox: (x:number, y:number, z:number) => AABB,
}