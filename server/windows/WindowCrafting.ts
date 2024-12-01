import InventoryType from "../enums/InventoryType";
import Inventory from "../inventories/Inventory";
import PlayerCombinedInventory from "../inventories/PlayerCombinedInventory";
import MPClient from "../MPClient";
import Window from "./Window";

export default class WindowCrafting extends Window {
	public constructor(inventory: PlayerCombinedInventory) {
		super(InventoryType.CraftingTable, inventory, 45);
	}
}