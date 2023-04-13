import { Chunk } from "../Chunk";
import { IQueuedUpdate } from "./IQueuedUpdate";

export class QueuedBlockUpdate implements IQueuedUpdate {
	public coordPair:number;
	public x:number;
	public y:number;
	public z:number;
	public blockId:number;
	public metadata:number;

	public constructor(coordPair:number, x:number, y:number, z:number, blockId:number, metadata?:number) {
		this.coordPair = coordPair;
		this.x = x;
		this.y = y;
		this.z = z;
		this.blockId = blockId;
		if (typeof(metadata) === "number") {
			this.metadata = metadata;
		} else {
			this.metadata = 0;
		}
	}
}