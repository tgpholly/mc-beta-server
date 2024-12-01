import { Endian, IReader, IWriter, createWriter } from "bufferstuff";
import FunkyArray from "funky-array";
import IInventory from "./IInventory";
import ItemStack from "./ItemStack";

export default class Inventory implements IInventory {
	private static CHANGE_HANDLER_ROLLING_HANDLE_ID = 0;

	public changeHandlers:FunkyArray<number, (itemStack: ItemStack) => void>;
	public itemStacks:Array<ItemStack | null>;

	public readonly size:number;
	public readonly name:string;

	public constructor(size:number, name:string) {
		this.changeHandlers = new FunkyArray<number, (itemStack: ItemStack) => void>();
		this.itemStacks = new Array<ItemStack | null>();
		for (let i = 0; i < size; i++) {
			this.itemStacks.push(null);
		}

		this.size = size;
		this.name = name;
	}

	registerChangeHandler(changeHandler: (itemStack: ItemStack) => void) {
		const changeHandlerHandle = Inventory.CHANGE_HANDLER_ROLLING_HANDLE_ID++;
		this.changeHandlers.set(changeHandlerHandle, changeHandler);
		return changeHandlerHandle;
	}

	unregisterChangeHandler(changeHandlerHandle: number) {
		if (this.changeHandlers.has(changeHandlerHandle)) {
			this.changeHandlers.remove(changeHandlerHandle);
		}
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
		for (let slotId = 0; slotId < this.itemStacks.length; slotId++) {
			if (itemStack.size === 0) {
				break;
			}

			this.itemStacks[slotId]?.insert(itemStack);
		}
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

	public calculateInventoryPayloadSize(skip: number) {
		let bufferSize = 0;
		for (let i = skip; i < this.itemStacks.length; i++) {
			const stack = this.itemStacks[i];
			if (stack) {
				bufferSize += 5; // short + byte + short
			} else {
				bufferSize += 2; // short
			}
		}
		return bufferSize;
	}

	constructInventoryPayload(skip: number) {
		const writer = createWriter(Endian.BE, this.calculateInventoryPayloadSize(skip));
		for (let i = skip; i < this.itemStacks.length; i++) {
			const stack = this.itemStacks[i];
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