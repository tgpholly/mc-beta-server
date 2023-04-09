import { World } from "../World";
import { Entity } from "./Entity";

export class EntityLiving extends Entity {
	public yaw:number;
	public pitch:number;
	public onGround:boolean;

	public constructor(world:World) {
		super(world);

		this.yaw = 0;
		this.pitch = 0;
		this.onGround = false;
	}

	onTick() {
		super.onTick();
	}
}