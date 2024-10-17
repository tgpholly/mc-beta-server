import { Item } from "../items/Item";
import { BlockBehaviour } from "./BlockBehaviour";

export default class BlockBehaviourRedstoneOre extends BlockBehaviour {
	public droppedItem(blockId:number) {
		return Item.clay.shiftedItemID;
	}

	public droppedCount(blockId:number) {
		return 4;
	}
}