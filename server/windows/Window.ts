import InventoryType from "../enums/InventoryType";
import Inventory from "../inventories/Inventory";
import ItemStack from "../inventories/ItemStack";
import MPClient from "../MPClient";
import PacketOpenWindow from "../packets/OpenWindow";

export default abstract class Window {
	public static WINDOW_GLOBAL_COUNTER = 1;
	
	public windowId = Window.WINDOW_GLOBAL_COUNTER++;
	public inventoryType: InventoryType;
	public inventory: Inventory;

	public cursorItemStack?: ItemStack;

	public constructor(inventoryType: InventoryType, inventory: Inventory) {
		this.inventoryType = inventoryType;
		this.inventory = inventory;
	}

	openWindow(mpClient: MPClient) {
		const windowPacket = new PacketOpenWindow(this.windowId, this.inventoryType, this.inventory.getInventoryName(), this.inventory.getInventorySize()).writeData();
		//const inventoryDataPayload = this.inventory.constructInventoryPayload();
		//mpClient.send(Buffer.concat([ windowPacket, inventoryDataPayload ], windowPacket.length + inventoryDataPayload.length));
		mpClient.send(windowPacket);
	}
}