export class Block {
	public readonly blockId:number;

	public constructor(blockId:number) {
		this.blockId = blockId;
	}

	static stone = new Block(1);
	static grass = new Block(2);
	static dirt = new Block(3);



	static bedrock = new Block(7);
}