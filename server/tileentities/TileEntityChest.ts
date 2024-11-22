import Block from "../blocks/Block";
import TileEntityType from "../enums/TileEntityType";
import TileEntity from "./TileEntity";
import Vec3 from "../Vec3";

export default class TileEntityChest extends TileEntity {
	public constructor(type: TileEntityType, forBlockId: Block, position: Vec3) {
		super(type, forBlockId, position);
	}
}