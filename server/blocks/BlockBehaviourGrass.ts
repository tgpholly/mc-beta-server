import Block from "./Block";
import BlockBehaviour from "./BlockBehaviour";

export default class BlockBehaviourGrass extends BlockBehaviour {
	public droppedItem(_blockId:number) {
		return Block.dirt.blockId;
	}
}