import { IReader, IWriter } from "bufferstuff";
import Block from "../blocks/Block";
import TileEntityType from "../enums/TileEntityType";
import Vec3 from "../Vec3";
import TileEntityChest from "./TileEntityChest";

export default class TileEntity {
	private readonly type: TileEntityType;
	private readonly forBlockId: Block;
	private readonly position: Vec3;

	public constructor(type: TileEntityType, forBlockId: Block, position: Vec3) {
		this.type = type;
		this.forBlockId = forBlockId;
		this.position = position;
	}

	public fromSave(reader:IReader) : TileEntity {
		let tileEntity:TileEntity;
		const type: TileEntityType = reader.readUByte();
		const forBlock = Block.blocks[reader.readUByte()];
		const position = new Vec3(reader.readUByte(), reader.readUByte(), reader.readUByte());
		if (type === TileEntityType.Chest) {
			tileEntity = new TileEntityChest(type, forBlock, position);
		} else {
			tileEntity = new TileEntity(type, forBlock, position);
		}

		return tileEntity;
	}

	public toSave(writer:IWriter) {
		
	}
}