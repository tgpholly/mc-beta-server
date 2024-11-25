import Block from "../blocks/Block";
import TileEntityType from "../enums/TileEntityType";
import TileEntity from "./TileEntity";
import Vec3 from "../Vec3";
import { IReader, IWriter } from "bufferstuff";
import Inventory from "../inventories/Inventory";

export default class TileEntityChest extends TileEntity {
	public inventory:Inventory;

	public constructor(type: TileEntityType, forBlockId: Block, position: Vec3) {
		super(type, forBlockId, position);

		this.inventory = new Inventory(9 * 3, "Chest");
	}

	public fromSave(reader:IReader) {
		super.fromSave(reader);

		this.inventory.fromSave(reader);
	}

	public toSave(writer:IWriter) {
		super.toSave(writer);

		this.inventory.toSave(writer);
	}
}