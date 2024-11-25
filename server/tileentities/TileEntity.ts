import { IReader, IWriter } from "bufferstuff";
import Block from "../blocks/Block";
import TileEntityType from "../enums/TileEntityType";
import Vec3 from "../Vec3";

export default abstract class TileEntity {
	public readonly type: TileEntityType;
	public readonly forBlock: Block;
	public readonly pos: Vec3;

	public constructor(type: TileEntityType, forBlock: Block, pos: Vec3) {
		this.type = type;
		this.forBlock = forBlock;
		this.pos = pos;
	}

	public fromSave(reader:IReader) {}

	public toSave(writer:IWriter) {
		writer.writeUByte(this.type);
		writer.writeUByte(this.pos.x).writeUByte(this.pos.y).writeUByte(this.pos.z);
	}
}