import { Endian, createWriter } from "bufferstuff";
import { ItemStack } from "./ItemStack";
import IInventory from "./IInventory";

export class Inventory implements IInventory {
	private itemStacks:Array<ItemStack | null>;

	private size:number;
	private name:string;

	public constructor(size:number, name:string) {
		this.itemStacks = new Array<ItemStack | null>();
		for (let i = 0; i < size; i++) {
			this.itemStacks.push(null);
		}

		this.size = size;
		this.name = name;
	}

	getInventoryName() {
		return this.name;
	}

	getInventorySize() {
		return this.itemStacks.length;
	}

	getSlotItemStack(slotId:number) {
		return this.itemStacks[slotId];
	}

	setSlotItemStack(slotId:number, itemStack: ItemStack | null) {
		if (slotId < 0 || slotId > this.size - 1) {
			throw new Error(`Tried to set an Inventory ItemStack out of bounds! Requested slot: ${slotId}, Inventory Size: ${this.size}`);
		}

		this.itemStacks[slotId] = itemStack;

		return this;
	}

	private calculateInventoryPayloadSize() {
		let bufferSize = 0;
		for (const stack of this.itemStacks) {
			if (stack) {
				bufferSize += 5; // short + byte + short
			} else {
				bufferSize += 2; // short
			}
		}
		return bufferSize;
	}

	constructInventoryPayload() {
		const writer = createWriter(Endian.BE, this.calculateInventoryPayloadSize());
		for (const stack of this.itemStacks) {
			writer.writeShort(stack == null ? -1 : stack.itemID);
			if (stack != null) {
				writer.writeByte(stack.size);
				writer.writeShort(stack.damage);
			}
		}

		return writer.toBuffer();
	}
}