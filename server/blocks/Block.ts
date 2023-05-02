export class Block {
	public readonly blockId:number;
	public static readonly blocks:Array<Block> = new Array<Block>();
	public static readonly lightPassage:Array<number> = new Array<number>();

	public constructor(blockId:number) {
		Block.blocks[blockId] = this;
		Block.lightPassage[blockId] = 0;
		this.blockId = blockId;
	}

	public get lightPassage() {
		return Block.lightPassage[this.blockId];
	}

	public set lightPassage(value:number) {
		Block.lightPassage[this.blockId] = value;
	}

	public setLightPassage(value:number) {
		this.lightPassage = value;
		return this;
	}

	// Define statics here
	static readonly stone = new Block(1);
	static readonly grass = new Block(2);
	static readonly dirt = new Block(3);

	static readonly bedrock = new Block(7);

	static readonly waterStill = new Block(9).setLightPassage(3);

	static readonly lavaStill = new Block(11);

	static readonly sand = new Block(12);
	static readonly gravel = new Block(13);

	static readonly wood = new Block(17);
	static readonly leaves = new Block(18).setLightPassage(1);

	static readonly glass = new Block(20).setLightPassage(255);

	static readonly tallGrass = new Block(31);

	static readonly flowerDandelion = new Block(37);
	static readonly flowerRose = new Block(38);

	static readonly clay = new Block(82);
}