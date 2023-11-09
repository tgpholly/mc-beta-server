import { IReader, IWriter } from "bufferstuff";
import { Block } from "../blocks/Block";
import { IEntity } from "../entities/IEntity";
import { Player } from "../entities/Player";
import { Item } from "../items/Item";

export class ItemStack {
	private static ITEMSTACK_ID_ADDER = 0;
	private readonly itemStackId:number;

	public readonly itemID:number;
	public readonly isBlock:boolean;
	public size:number;
	public damage:number;

	private readonly maxSize:number;
	private readonly maxDamage:number;
	private readonly canBeDamaged:boolean;

	public constructor(blockOrItemOrItemID:Block|Item|number, size?:number, damage?:number) {
		if (blockOrItemOrItemID instanceof Block && size === undefined && damage === undefined) {
			this.itemID = blockOrItemOrItemID.blockId;
			this.size = 0;
			this.damage = 0;
		} else if (blockOrItemOrItemID instanceof Block && typeof(size) === "number" && damage === undefined) {
			this.itemID = blockOrItemOrItemID.blockId;
			this.size = size;
			this.damage = 0;
		} else if (blockOrItemOrItemID instanceof Block && typeof(size) === "number" && typeof(damage) === "number") {
			this.itemID = blockOrItemOrItemID.blockId;
			this.size = size;
			this.damage = damage;
		} else if (blockOrItemOrItemID instanceof Item && size === undefined && damage === undefined) {
			this.itemID = blockOrItemOrItemID.shiftedItemID;
			this.size = 0;
			this.damage = 0;
		} else if (blockOrItemOrItemID instanceof Item && typeof(size) === "number" && damage === undefined) {
			this.itemID = blockOrItemOrItemID.shiftedItemID;
			this.size = size;
			this.damage = 0;
		} else if (blockOrItemOrItemID instanceof Item && typeof(size) === "number" && typeof(damage) === "number") {
			this.itemID = blockOrItemOrItemID.shiftedItemID;
			this.size = size;
			this.damage = damage;
		} else if (typeof(blockOrItemOrItemID) === "number" && typeof(size) === "number" && typeof(damage) === "number") {
			this.itemID = blockOrItemOrItemID;
			this.size = size;
			this.damage = damage;
		} else if (typeof(blockOrItemOrItemID) === "number" && typeof(size) === "number" && damage === undefined) {
			this.itemID = blockOrItemOrItemID;
			this.size = size;
			this.damage = 0;
		} else if (typeof(blockOrItemOrItemID) === "number" && size === undefined && damage === undefined) {
			this.itemID = blockOrItemOrItemID;
			this.size = 0;
			this.damage = 0;
		} else {
			throw new Error(`ItemStack created with invalid properties (${typeof(blockOrItemOrItemID)}, ${typeof(size)}, ${typeof(damage)})`);
		}

		this.isBlock = this.itemID < 256;
		this.maxSize = this.isBlock ? 64 : Item.getByShiftedItemId(this.itemID).maxStackSize;
		this.maxDamage = this.isBlock ? 0 : Item.getByShiftedItemId(this.itemID).maxDamage;
		this.canBeDamaged = this.maxDamage > 0;

		this.itemStackId = ItemStack.ITEMSTACK_ID_ADDER++;
	}

	public static FromSave(reader:IReader) {
		const itemId = reader.readShort();
		if (itemId === -1) {
			return null;
		}

		return new ItemStack(itemId, reader.readByte(), reader.readShort());
	}

	public toSave(writer:IWriter) {
		writer.writeShort(this.itemID)
			  .writeByte(this.size)
			  .writeShort(this.damage);
	}

	public static Compare(itemStack1:ItemStack, itemStack2:ItemStack) {
		return itemStack1.itemStackId === itemStack2.itemStackId;
	}

	public compare(itemStack:ItemStack) {
		return this.itemStackId === itemStack.itemStackId;
	}

	public insert(itemStack:ItemStack) {
		const remainingSpace = this.spaceAvaliable;
		if (remainingSpace === 0) {
			return;
		}

		if (remainingSpace >= itemStack.size) {
			this.size += itemStack.size;
			itemStack.size = 0;
			return;
		}

		if (remainingSpace < itemStack.size) {
			this.size += remainingSpace;
			itemStack.size -= remainingSpace;
		}
	}

	public damageItem(damageAmount:number, entity:IEntity) {
		if (!this.canBeDamaged) {
			return;
		}

		this.damage += damageAmount;
		if (this.damage > this.maxDamage) {
			this.size--;
			if (this.size < 0) {
				this.size = 0;
			}
			this.damage = 0;
		}
	}

	public get spaceAvaliable() {
		// Stack size check for Item(s) and Block(s).
		return Math.max(this.maxSize - this.size, 0);
	}

	split(amount:number) {
		this.size -= amount;
		return new ItemStack(this.itemID, amount, this.damage);
	}
}