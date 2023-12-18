import { Player } from "../entities/Player";
import { PacketSetSlot } from "../packets/SetSlot";
import { PacketWindowItems } from "../packets/WindowItems";
import { Inventory } from "./Inventory";
import { ItemStack } from "./ItemStack";

export default class PlayerInventory extends Inventory {
	private player:Player;

	public constructor(player:Player) {
		super(44, "Player Inventory");

		this.player = player;
	}

	sendUpdatedStacks(stackIdsChanged:Array<number>) {
		let updateBuffer = Buffer.alloc(0);
		for (const slotId of stackIdsChanged) {
			const slotItem = this.itemStacks[slotId];
			let buffer:Buffer;
			if (slotItem == null) {
				buffer = new PacketSetSlot(0, slotId, -1).writeData();
			} else {
				buffer = new PacketSetSlot(0, slotId, slotItem.itemID, slotItem.size, slotItem.damage).writeData();
			}

			updateBuffer = Buffer.concat([updateBuffer, buffer], updateBuffer.length + buffer.length);
		}
		if (updateBuffer.length > 0) {
			this.player.mpClient?.send(updateBuffer);
		}
	}

	addItemStack(itemStack:ItemStack) {
		const itemStacksOfSameType:Array<ItemStack> = new Array<ItemStack>();
		const itemStackIds:Array<number> = new Array<number>();
		const stackIdsChanged:Array<number> = new Array<number>();

		// Check bottom inventory row (hotbar) first.
		let workingItemStack:ItemStack | null;
		for (let slotId = 36; slotId <= 44; slotId++) {
			if ((workingItemStack = this.itemStacks[slotId]) != null) {
				itemStacksOfSameType.push(workingItemStack);
				itemStackIds.push(slotId);
			}
		}

		for (let slotId = 9; slotId <= 35; slotId++) {
			if ((workingItemStack = this.itemStacks[slotId]) != null) {
				itemStacksOfSameType.push(workingItemStack);
				itemStackIds.push(slotId);
			}
		}

		// Insert into existing stacks first.
		for (let i = 0; i < itemStacksOfSameType.length; i++) {
			const inventoryItemStack = itemStacksOfSameType[i];
			// Exit early if we have nothing left
			if (itemStack.size === 0) {
				return this.sendUpdatedStacks(stackIdsChanged);
			}

			if (inventoryItemStack.itemID !== itemStack.itemID || inventoryItemStack.damage !== itemStack.damage) {
				continue;
			}

			if (inventoryItemStack.insert(itemStack)) {
				stackIdsChanged.push(itemStackIds[i]);
			}
		}

		// Exit early if we have nothing left
		if (itemStack.size === 0) {
			return this.sendUpdatedStacks(stackIdsChanged);
		}

		for (let slotId = 36; slotId <= 44; slotId++) {
			// Exit early if we have nothing left
			if (itemStack.size === 0) {
				return this.sendUpdatedStacks(stackIdsChanged);
			}

			if ((workingItemStack = this.itemStacks[slotId]) == null) {
				const stack = this.itemStacks[slotId] = new ItemStack(itemStack.itemID, 0, itemStack.damage);
				if (stack.insert(itemStack)) {
					stackIdsChanged.push(slotId);
				}
			}
		}

		for (let slotId = 9; slotId <= 35; slotId++) {
			// Exit early if we have nothing left
			if (itemStack.size === 0) {
				return this.sendUpdatedStacks(stackIdsChanged);
			}

			if ((workingItemStack = this.itemStacks[slotId]) == null) {
				const stack = this.itemStacks[slotId] = new ItemStack(itemStack.itemID, 0, itemStack.damage);
				if (stack.insert(itemStack)) {
					stackIdsChanged.push(slotId);
				}
			}
		}

		this.sendUpdatedStacks(stackIdsChanged)
	}
}