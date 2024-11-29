import TileEntityChest from "../tileentities/TileEntityChest";
import Vec3 from "../Vec3";
import World from "../World";
import BlockBehaviour from "./BlockBehaviour";

export default class BlockBehaviourCraftingTable extends BlockBehaviour {
	public interactable() {
		return true;
	}
}