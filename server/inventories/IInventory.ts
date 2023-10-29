import { ItemStack } from "./ItemStack";

export default interface IInventory {
	getInventoryName:() => string,
	getInventorySize:() => number,
	getSlotItemStack:(slotId:number) => ItemStack | null
	setSlotItemStack:(slotId:number, itemStack:ItemStack | null) => IInventory
}