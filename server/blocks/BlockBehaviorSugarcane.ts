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

	public canPlaceBlockAt(world: World, x: number, y: number, z: number) {
		const blockBelow = world.getBlockId(x, y - 1, z);

		if (blockBelow === this.block.blockId) {
			return true;
		}

		// Check if right ground block
		if (blockBelow !== Block.grass.blockId && blockBelow !== Block.dirt.blockId) {
			return false;
		}

		// Check if water is around
		if (world.getBlockId(x - 1, y - 1, z) === Block.waterStill.blockId) {
			return true;
		}
		if (world.getBlockId(x + 1, y - 1, z) === Block.waterStill.blockId) {
			return true;
		}
		if (world.getBlockId(x, y - 1, z - 1) === Block.waterStill.blockId) {
			return true;
		}
		if (world.getBlockId(x, y - 1, z + 1) === Block.waterStill.blockId) {
			return true;
		}

		return false;
	}

	public getBoundingBox() {
		return AABB.getAABB(0, 0, 0, 0, 0, 0);
	}
}