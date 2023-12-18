import { Player } from "../entities/Player";
import { Inventory } from "./Inventory";
import { ItemStack } from "./ItemStack";

export default class PlayerInventory extends Inventory {
	private player:Player;

	public constructor(player:Player) {
		super(44, "Player Inventory");

		this.player = player;
	}

	addItemStack(itemStack:ItemStack) {
		const itemStacksOfSameType:Array<ItemStack> = new Array<ItemStack>();

		// Check bottom inventory row (hotbar) first.
		let workingItemStack:ItemStack | null;
		for (let slotId = 36; slotId <= 44; slotId++) {
			if ((workingItemStack = this.itemStacks[slotId]) != null) {
				itemStacksOfSameType.push(workingItemStack);
			}
		}

		for (let slotId = 9; slotId <= 35; slotId++) {
			if ((workingItemStack = this.itemStacks[slotId]) != null) {
				itemStacksOfSameType.push(workingItemStack);
			}
		}

		// Insert into existing stacks first.
		for (const inventoryItemStack of itemStacksOfSameType) {
			// Exit early if we have nothing left
			if (itemStack.size === 0) {
				return;
			}

			if (inventoryItemStack.itemID !== itemStack.itemID || inventoryItemStack.damage !== itemStack.damage) {
				continue;
			}

			inventoryItemStack.insert(itemStack);
		}

		// Exit early if we have nothing left
		if (itemStack.size === 0) {
			return;
		}

		for (let slotId = 36; slotId <= 44; slotId++) {
			// Exit early if we have nothing left
			if (itemStack.size === 0) {
				return;
			}

			if ((workingItemStack = this.itemStacks[slotId]) == null) {
				const stack = this.itemStacks[slotId] = new ItemStack(itemStack.itemID, 0, itemStack.damage);
				stack.insert(itemStack);
			}
		}

		for (let slotId = 9; slotId <= 35; slotId++) {
			// Exit early if we have nothing left
			if (itemStack.size === 0) {
				return;
			}

			if ((workingItemStack = this.itemStacks[slotId]) == null) {
				const stack = this.itemStacks[slotId] = new ItemStack(itemStack.itemID, 0, itemStack.damage);
				stack.insert(itemStack);
			}
		}
	}
}