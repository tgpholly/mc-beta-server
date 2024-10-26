import BlockBehaviour from "./BlockBehaviour";
import Item from "../items/Item";

export default class BlockBehaviourOre extends BlockBehaviour {
	public droppedItem(blockId:number) {
		return Item.clay.shiftedItemID;
	}

	public droppedCount(blockId:number) {
		return 4;
	}
}