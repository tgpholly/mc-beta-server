import { createWriter, Endian } from "bufferstuff";
import MPClient from "../MPClient";
import Inventory from "./Inventory";
import ItemStack from "./ItemStack";

export default class PlayerCombinedInventory extends Inventory {
	private static PLAYER_INVENTORY_OFFSET = 9;

	private mpClient: MPClient;

	public constructor(mpClient:MPClient, size: number, name: string) {
		super(size, name);

		this.mpClient = mpClient;
	}

	private getSlotId(slotId: number) {
		if (slotId > this.size - 1) {
			return (slotId - this.size) + PlayerCombinedInventory.PLAYER_INVENTORY_OFFSET;
		} else {
			return slotId;
		}
	}

	static FromExisting(mpClient: MPClient, inventory: Inventory, name: string) {
		const linkedInventory = new PlayerCombinedInventory(mpClient, inventory.size, name);
		linkedInventory.itemStacks = inventory.itemStacks;
		linkedInventory.changeHandlers = inventory.changeHandlers;
		return linkedInventory;
	}

	addItemStack(itemStack:ItemStack) {
		for (let slotId = 0; slotId < this.itemStacks.length; slotId++) {
			if (itemStack.size === 0) {
				break;
			}

			this.itemStacks[slotId]?.insert(itemStack);
		}

		if (itemStack.size === 0) {
			return;
		}

		for (let slotId = 0; slotId < this.mpClient.entity.inventory.itemStacks.length; slotId++) {
			if (itemStack.size === 0) {
				break;
			}

			this.mpClient.entity.inventory.itemStacks[slotId]?.insert(itemStack);
		}
	}

	// getInventorySize() {
	// 	return this.itemStacks.length + this.mpClient.entity.inventory.itemStacks.length;
	// }

	getSlotItemStack(slotId:number) {
		if (slotId > this.size - 1) {
			return this.mpClient.entity.inventory.itemStacks[this.getSlotId(slotId)];
		}

		return this.itemStacks[slotId];
	}

	dropEmptyItemStacks() {
		super.dropEmptyItemStacks();
		this.mpClient.entity.inventory.dropEmptyItemStacks();
	}

	setSlotItemStack(slotId:number, itemStack: ItemStack | null) {
		if (slotId > this.size - 1) {
			this.mpClient.entity.inventory.setSlotItemStack(this.getSlotId(slotId), itemStack);
		} else {
			super.setSlotItemStack(slotId, itemStack);
		}

		return this;
	}

	constructInventoryPayload() {
		const thisInventoryPayload = super.constructInventoryPayload(0);
		const playerInventoryPayload = this.mpClient.entity.inventory.constructInventoryPayload(PlayerCombinedInventory.PLAYER_INVENTORY_OFFSET);
		return Buffer.concat([thisInventoryPayload, playerInventoryPayload], thisInventoryPayload.length + playerInventoryPayload.length);
	}

	constructInventorySinglePayload(slotId:number) {
		const stack = this.itemStacks[slotId] ?? this.mpClient.entity.inventory.itemStacks[this.getSlotId(slotId)];
		const writer = createWriter(Endian.BE, stack == null ? 2 : 5);
		writer.writeShort(stack == null ? -1 : stack.itemID);
		if (stack != null) {
			writer.writeByte(stack.size);
			writer.writeShort(stack.damage);
		}

		return writer.toBuffer();
	}
}