import { FunkyArray } from "../../funkyArray";
import { ItemStack } from "./ItemStack";
import { ContainerSlot } from "./Slot";

export abstract class Container {
	public itemSlots:Array<ContainerSlot>;
	public itemStacks:Array<ItemStack>;

	public constructor() {
		this.itemSlots = new Array<ContainerSlot>();
		this.itemStacks = new Array<ItemStack>();
	}
}