import BlockBehaviour from "./BlockBehaviour";
import Item from "../items/Item";

export default class BlockBehaviourClay extends BlockBehaviour {
	public droppedItem(blockId:number) {
		return Item.clay.shiftedItemID;
	}

	public droppedCount(blockId:number) {
		return 4;
	}
}