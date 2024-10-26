import Block from "./Block";
import BlockBehaviour from "./BlockBehaviour";

export default class BlockBehaviourStone extends BlockBehaviour {
	public droppedItem(blockId:number) {
		return Block.cobblestone.blockId;
	}
}