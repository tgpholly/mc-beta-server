import InventoryType from "../enums/InventoryType";
import Inventory from "../inventories/Inventory";
import MPClient from "../MPClient";
import Window from "./Window";

export default class WindowCrafting extends Window {
	public constructor(mpClient: MPClient) {
		super(InventoryType.CraftingTable, new Inventory(45, "Crafting"));
	}
}