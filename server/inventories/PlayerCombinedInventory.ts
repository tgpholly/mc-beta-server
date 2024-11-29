import Inventory from "./Inventory";
import ItemStack from "./ItemStack";

export default class PlayerCombinedInventory extends Inventory {
	private combinedInventoryChangeHandlerHandle: number;

	public constructor(size: number, name: string) {
		super(size, name);

		this.combinedInventoryChangeHandlerHandle = this.registerChangeHandler(this.onInventoryChange);
	}

	private onInventoryChange(itemStack: ItemStack) {
		
	}
}