import InventoryType from "../enums/InventoryType";
import Inventory from "../inventories/Inventory";
import PlayerCombinedInventory from "../inventories/PlayerCombinedInventory";
import Window from "./Window";

export default class WindowChest extends Window {
	public constructor(inventory: PlayerCombinedInventory) {
		super(InventoryType.Chest, inventory, 62);
	}
}