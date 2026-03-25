import BlockBehaviour from "./BlockBehaviour";
import Item from "../items/Item";

export default class BlockBehaviourOre extends BlockBehaviour {
	public droppedItem(_blockId:number) {
		return Item.clay.shiftedItemID;
	}

	public droppedCount(_blockId:number) {
		return 4;
	}
}