export class Block {
	public readonly blockId:number;

	public constructor(blockId:number) {
		this.blockId = blockId;
	}

	// Define statics here
	static readonly stone = new Block(1);
	static readonly grass = new Block(2);
	static readonly dirt = new Block(3);

	static readonly bedrock = new Block(7);

	static readonly waterStill = new Block(9);

	static readonly sand = new Block(12);
	static readonly gravel = new Block(13);

	static readonly wood = new Block(17);
	static readonly leaves = new Block(18);

	static readonly clay = new Block(82);
}