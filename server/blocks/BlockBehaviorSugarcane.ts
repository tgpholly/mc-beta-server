import AABB from "../AABB";
import { World } from "../World";
import { Block } from "./Block";
import { BlockBehaviour } from "./BlockBehaviour";

export class BlockBehaviourSugarcane extends BlockBehaviour {
	public neighborBlockChange(world:World, x:number, y:number, z:number, blockId:number) {
		const block = world.getBlockId(x, y - 1, z);
		if (block === 0 || block !== Block.sugarcane.blockId) {
			world.setBlockWithNotify(x, y, z, 0);
		}
	}

	public getBoundingBox() {
		return AABB.getAABB(0, 0, 0, 0, 0, 0);
	}
}