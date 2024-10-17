import Random from "../Random";
import { World } from "../World";
import { BlockBehaviour } from "./BlockBehaviour";

export class BlockBehaviourSapling extends BlockBehaviour {
	public randomTick(world:World, x:number, y:number, z:number, random:Random) {
		if (world.getBlockLight(x, y + 1, z) >= 9 && random.nextInt(30) === 0) {
			const blockMetadata = world.getBlockMetadata(x, y, z);
			if ((blockMetadata & 8) === 0) {
				world.setBlockMetadataWithNotify(x, y, z, blockMetadata | 8);
			} else {
				console.log("UNIMPLEMENTED TREE GROW!!");
			}
		}
	}
}