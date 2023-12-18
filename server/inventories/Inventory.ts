import { Endian, IReader, IWriter, createWriter } from "bufferstuff";
import { ItemStack } from "./ItemStack";
import IInventory from "./IInventory";

export class Inventory implements IInventory {
	public itemStacks:Array<ItemStack | null>;

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

	public fromSave(reader:IReader) {
		const inventorySize = reader.readByte();
		for (let i = 0; i < inventorySize; i++) {
			this.itemStacks[i] = ItemStack.FromSave(reader);
		}
	}

	public toSave(writer:IWriter) {
		writer.writeByte(this.size);
		for (const itemStack of this.itemStacks) {
			if (itemStack === null) {
				writer.writeShort(-1);
				continue;
			}

			itemStack.toSave(writer);
		}
	}

	addItemStack(itemStack:ItemStack) {
		throw new Error("Adding items to non player inventories is unimplemented.");
		// Check bottom inventory row (hotbar) first.
		/*let workingItemStack:ItemStack | null;
		for (let slotId = 9; slotId <= 35; slotId++) {
			if (itemStack.size === 0) {
				break;
			}

			if ((workingItemStack = this.itemStacks[slotId]) != null) {
				workingItemStack.insert(itemStack);
			}
		}*/
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

	dropEmptyItemStacks() {
		for (let i = 0; i < this.itemStacks.length; i++) {
			const itemStack = this.itemStacks[i];
			if (itemStack?.size === 0) {
				this.itemStacks[i] = null;
			}
		}
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

	constructInventorySinglePayload(slotId:number) {
		const stack = this.itemStacks[slotId];
		const writer = createWriter(Endian.BE, stack == null ? 2 : 5);
		writer.writeShort(stack == null ? -1 : stack.itemID);
		if (stack != null) {
			writer.writeByte(stack.size);
			writer.writeShort(stack.damage);
		}

		return writer.toBuffer();
	}
}