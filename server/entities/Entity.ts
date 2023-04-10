import { World } from "../World";
import { IEntity } from "./IEntity";

export class Entity implements IEntity {
	public static nextEntityId:number = 0;

	public entityId:number;

	public world:World;
	public x:number;
	public y:number;
	public z:number;
	public lastX:number;
	public lastY:number;
	public lastZ:number;

	public constructor(world:World) {
		this.entityId = Entity.nextEntityId++;
		
		this.world = world;
		this.x = this.y = this.z = this.lastX = this.lastY = this.lastZ = 0;
	}

	distanceTo(entity:IEntity) {
		const dX = entity.x - this.x,
			  dY = entity.y - this.y,
			  dZ = entity.z - this.z;
			  
		return Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2) + Math.pow(dZ, 2));
	}

	onTick() {
		this.lastX = this.x;
		this.lastY = this.y;
		this.lastZ = this.z;
	}
}