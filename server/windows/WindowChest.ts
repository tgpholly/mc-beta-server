import InventoryType from "../enums/InventoryType";
import Inventory from "../inventories/Inventory";
import Window from "./Window";

export default class WindowChest extends Window {
	public constructor(inventory: Inventory) {
		super(InventoryType.Chest, inventory);
	}
}