import InventoryType from "../enums/InventoryType";
import PlayerCombinedInventory from "../inventories/PlayerCombinedInventory";
import MPClient from "../MPClient";
import Window from "./Window";

export default class WindowCrafting extends Window {
	public constructor(mpClient: MPClient, inventory: PlayerCombinedInventory) {
		super(InventoryType.CraftingTable, inventory, mpClient, 45);
	}
}