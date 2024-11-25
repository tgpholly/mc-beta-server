import { IReader } from "bufferstuff";
import Block from "../blocks/Block";
import TileEntity from "./TileEntity";
import TileEntityChest from "./TileEntityChest";
import TileEntityType from "../enums/TileEntityType";
import Vec3 from "../Vec3";

// I would like this to be in TileEntity, but recursive dependency.
export default abstract class TileEntityLoader {
	public static FromSave(reader:IReader) : TileEntity {
		let tileEntity:TileEntity;
		const type: TileEntityType = reader.readUByte();
		const forBlock = Block.blocks[reader.readUByte()];
		const position = new Vec3(reader.readUByte(), reader.readUByte(), reader.readUByte());
		if (type === TileEntityType.Chest) {
			tileEntity = new TileEntityChest(type, forBlock, position);
		} else {
			tileEntity = new TileEntity(type, forBlock, position);
		}
		// Call instantiated class' fromSave
		tileEntity.fromSave(reader);

		return tileEntity;
	}
}