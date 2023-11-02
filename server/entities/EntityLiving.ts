import { Rotation } from "../Rotation";
import { Vec3 } from "../Vec3";
import { World } from "../World";
import { Block } from "../blocks/Block";
import { PacketAnimation } from "../packets/Animation";
import { PacketEntityLook } from "../packets/EntityLook";
import { PacketEntityLookRelativeMove } from "../packets/EntityLookRelativeMove";
import { PacketEntityRelativeMove } from "../packets/EntityRelativeMove";
import { PacketEntityStatus } from "../packets/EntityStatus";
import { PacketEntityTeleport } from "../packets/EntityTeleport";
import { Entity } from "./Entity";
import { IEntity } from "./IEntity";

export class EntityLiving extends Entity {
	public onGround:boolean;
	public fallDistance:number;
	public timeInWater:number;
	public headHeight:number;

	public constructor(world:World) {
		super(world);

		this.fallDistance = this.timeInWater = 0;
		this.onGround = true;
		this.headHeight = 1.62;
	}

	damageFrom(damage:number, entity?:IEntity) {
		if (this.health <= 0) {
			return;
		}
		super.damageFrom(damage, entity);

		// Send Damage Animation packet
		this.sendToAllNearby(new PacketEntityStatus(this.entityId, 2).writeData());
	}

	isInWater() {
		return this.world.getChunkBlockId(this.chunk, this.position.x, this.position.y + this.headHeight, this.position.z) === Block.waterStill.blockId;
	}

	onTick() {
		super.onTick();

		if (!this.onGround) {
			this.fallDistance
		}

		// Drowning
		if (this.isInWater()) {
			if (this.timeInWater == Number.MIN_SAFE_INTEGER) {
				this.timeInWater = 320;
			}
			if (this.timeInWater <= 0 && this.timeInWater % 20 === 0) {
				this.damageFrom(1);
			}
			this.timeInWater--;				
		} else {
			this.timeInWater = Number.MIN_SAFE_INTEGER;
		}
	}
}