import { World } from "../World";
import { Block } from "./Block";
import { BlockBehaviour } from "./BlockBehaviour";

export class BlockBehaviourFlower extends BlockBehaviour {
	public neighborBlockChange(world:World, x:number, y:number, z:number, blockId:number) {
		const block = world.getBlockId(x, y - 1, z);
		if (block !== Block.grass.blockId && block !== Block.dirt.blockId) {
			world.setBlockWithNotify(x, y, z, 0);
		}
	}
}