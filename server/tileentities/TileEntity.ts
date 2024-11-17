import Block from "../blocks/Block";
import TileEntityType from "../enums/TileEntityType";
import Vec3 from "../Vec3";

export default class TileEntity {
	private readonly type: TileEntityType;
	private readonly forBlockId: Block;
	private readonly position: Vec3;

	public constructor(type: TileEntityType, forBlockId: Block, position: Vec3) {
		this.type = type;
		this.forBlockId = forBlockId;
		this.position = position;
	}
}