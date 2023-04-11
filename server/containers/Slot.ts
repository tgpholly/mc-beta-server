import { IInventory } from "../inventories/IInventory";

export class ContainerSlot {
	public inventory:IInventory;
	public index:number;

	public constructor(inventory:IInventory, index:number) {
		this.inventory = inventory;
		this.index = index;
	}
}