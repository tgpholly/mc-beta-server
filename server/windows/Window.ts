import InventoryType from "../enums/InventoryType";
import Inventory from "../inventories/Inventory";
import ItemStack from "../inventories/ItemStack";
import PlayerCombinedInventory from "../inventories/PlayerCombinedInventory";
import MPClient from "../MPClient";
import PacketOpenWindow from "../packets/OpenWindow";
import PacketWindowItems from "../packets/WindowItems";

export default abstract class Window {
	public static WINDOW_GLOBAL_COUNTER = 1;
	
	public readonly inventorySize: number;

	public windowId = Window.WINDOW_GLOBAL_COUNTER++;
	public inventoryType: InventoryType;
	public inventory: PlayerCombinedInventory;

	public cursorItemStack: ItemStack | null;

	public constructor(inventoryType: InventoryType, inventory: PlayerCombinedInventory, inventorySize: number) {
		this.inventorySize = inventorySize;

		this.inventoryType = inventoryType;
		this.inventory = inventory;

		this.cursorItemStack = null;
	}

	openWindow(mpClient: MPClient) {
		const windowPacket = new PacketOpenWindow(this.windowId, this.inventoryType, this.inventory.getInventoryName(), this.inventory.getInventorySize()).writeData();
		const windowItems = new PacketWindowItems(this.windowId, this.inventorySize, this.inventory.constructInventoryPayload()).writeData();
		mpClient.send(Buffer.concat([ windowPacket, windowItems ], windowPacket.length + windowItems.length));
		//mpClient.send(windowPacket);
		//mpClient.send(inventoryDataPayload);
	}

	clickedWindow(slotId: number, rightClick: boolean) {
		if (this.cursorItemStack) {

		} else {
			this.cursorItemStack = this.inventory.getSlotItemStack(slotId);
		}
	}
}