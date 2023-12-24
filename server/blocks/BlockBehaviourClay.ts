import { Item } from "../items/Item";
import { BlockBehaviour } from "./BlockBehaviour";

export class BlockBehaviourClay extends BlockBehaviour {
	public droppedItem(blockId:number) {
		return Item.clay.shiftedItemID;
	}

	public droppedCount(blockId:number) {
		return 4;
	}
}