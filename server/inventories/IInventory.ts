import { IReader, IWriter } from "bufferstuff";
import { ItemStack } from "./ItemStack";

export default interface IInventory {
	fromSave:(reader:IReader) => void,
	toSave:(writer:IWriter) => void,
	getInventoryName:() => string,
	getInventorySize:() => number,
	getSlotItemStack:(slotId:number) => ItemStack | null
	setSlotItemStack:(slotId:number, itemStack:ItemStack | null) => IInventory
}