import { Block } from "./Block";
import { BlockBehaviour } from "./BlockBehaviour";

export class BlockBehaviourGrass extends BlockBehaviour {
	public droppedItem(blockId:number) {
		return Block.dirt.blockId;
	}
}