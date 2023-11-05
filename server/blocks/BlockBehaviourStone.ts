import { Block } from "./Block";
import { BlockBehaviour } from "./BlockBehaviour";

export class BlockBehaviourStone extends BlockBehaviour {
	public droppedItem(blockId:number) {
		return Block.cobblestone.blockId;
	}
}