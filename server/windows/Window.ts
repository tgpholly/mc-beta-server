import InventoryType from "../enums/InventoryType";
import Inventory from "../inventories/Inventory";
import ItemStack from "../inventories/ItemStack";
import PlayerCombinedInventory from "../inventories/PlayerCombinedInventory";
import MPClient from "../MPClient";
import PacketOpenWindow from "../packets/OpenWindow";
import PacketSetSlot from "../packets/SetSlot";
import PacketWindowItems from "../packets/WindowItems";

export default abstract class Window {
	public static WINDOW_GLOBAL_COUNTER = 1;
	
	public readonly inventorySize: number;

	public windowId = Window.WINDOW_GLOBAL_COUNTER++;
	public inventoryType: InventoryType;
	public inventory: PlayerCombinedInventory;
	private readonly mpClient: MPClient;

	private readonly inventoryUpdateHandle: number;

	public cursorItemStack: ItemStack | null;

	public constructor(inventoryType: InventoryType, inventory: PlayerCombinedInventory, mpClient: MPClient, inventorySize: number) {
		this.inventorySize = inventorySize;

		this.inventoryType = inventoryType;
		this.inventory = inventory;
		this.mpClient = mpClient;

		this.inventoryUpdateHandle = this.inventory.registerChangeHandler((slotId) => {
			const slotItem = this.inventory.getSlotItemStack(slotId);
			if (slotItem == null) {
				this.mpClient.send(new PacketSetSlot(this.windowId, slotId, -1).writeData());
			} else {
				this.mpClient.send(new PacketSetSlot(this.windowId, slotId, slotItem.itemID, slotItem.size, slotItem.damage).writeData());
			}
		});

		this.cursorItemStack = null;
	}

	openWindow() {
		const windowPacket = new PacketOpenWindow(this.windowId, this.inventoryType, this.inventory.getInventoryName(), this.inventory.getInventorySize()).writeData();
		const windowItems = new PacketWindowItems(this.windowId, this.inventorySize, this.inventory.constructInventoryPayload()).writeData();
		this.mpClient.send(Buffer.concat([ windowPacket, windowItems ], windowPacket.length + windowItems.length));
	}

	clickedWindow(slotId: number, rightClick: boolean) {
		const slotItemStack = this.inventory.getSlotItemStack(slotId);
		if (this.cursorItemStack) {
			if (rightClick) {
				if (slotItemStack) {
					slotItemStack.insert(this.cursorItemStack.split(1));
					this.inventory.sendSlotUpdate(slotId);
				} else {
					this.inventory.setSlotItemStack(slotId, this.cursorItemStack.split(1));
				}
				if (this.cursorItemStack.size === 0) {
					this.cursorItemStack = null;
				}
			} else {
				if (slotItemStack) {
					slotItemStack.insert(this.cursorItemStack);
					this.inventory.sendSlotUpdate(slotId);
					if (this.cursorItemStack.size === 0) {
						this.cursorItemStack = null;
					}
				} else {
					this.inventory.setSlotItemStack(slotId, this.cursorItemStack);
					this.cursorItemStack = null;
				}
			}
		} else {
			if (slotItemStack) {
				if (rightClick) {
					this.cursorItemStack = slotItemStack.split(Math.ceil(slotItemStack.size / 2));
					this.inventory.sendSlotUpdate(slotId);
				} else {
					this.cursorItemStack = slotItemStack;
					this.inventory.setSlotItemStack(slotId, null);
				}
			}
		}
	}

	closeWindow() {
		this.inventory.unregisterChangeHandler(this.inventoryUpdateHandle);
	}
}