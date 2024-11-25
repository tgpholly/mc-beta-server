import { IReader } from "bufferstuff";
import TileEntity from "./TileEntity";
import TileEntityChest from "./TileEntityChest";
import TileEntityType from "../enums/TileEntityType";
import Vec3 from "../Vec3";
import UnsupportedError from "../errors/UnsupportedError";

// I would like this to be in TileEntity, but recursive dependency.
export default abstract class TileEntityLoader {
	public static FromSave(reader:IReader) : TileEntity {
		let tileEntity:TileEntity;
		const type: TileEntityType = reader.readUByte();
		const position = new Vec3(reader.readUByte(), reader.readUByte(), reader.readUByte());
		if (type === TileEntityType.Chest) {
			tileEntity = new TileEntityChest(position);
		} else {
			throw new UnsupportedError("Unsupported tile entity type encountered");
		}
		// Call instantiated class' fromSave
		tileEntity.fromSave(reader);

		return tileEntity;
	}
}