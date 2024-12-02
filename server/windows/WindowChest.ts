import InventoryType from "../enums/InventoryType";
import Inventory from "../inventories/Inventory";
import PlayerCombinedInventory from "../inventories/PlayerCombinedInventory";
import MPClient from "../MPClient";
import Window from "./Window";

export default class WindowChest extends Window {
	public constructor(mpClient: MPClient, inventory: PlayerCombinedInventory) {
		super(InventoryType.Chest, inventory, mpClient, 62);
	}
}