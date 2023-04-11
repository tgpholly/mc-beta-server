import { ItemStack } from "../containers/ItemStack";

export interface IInventory {
	getInventoryName:() => string,
	getInventorySize:() => number,
	getSlotItemStack:(slotId:number) => ItemStack
}