import { IReader, IWriter } from "bufferstuff";
import { Rotation } from "../Rotation";
import Vec3 from "../Vec3";
import { World } from "../World";
import { Block } from "../blocks/Block";
import { EntityStatus } from "../enums/EntityStatus";
import { PacketAnimation } from "../packets/Animation";
import { PacketEntityLook } from "../packets/EntityLook";
import { PacketEntityLookRelativeMove } from "../packets/EntityLookRelativeMove";
import { PacketEntityRelativeMove } from "../packets/EntityRelativeMove";
import { PacketEntityStatus } from "../packets/EntityStatus";
import { PacketEntityTeleport } from "../packets/EntityTeleport";
import { Entity } from "./Entity";
import { IEntity } from "./IEntity";

export class EntityLiving extends Entity {
	public timeInWater:number;
	public headHeight:number;
	public lastHealth:number;

	public constructor(world:World, isPlayer:boolean = false) {
		super(world, isPlayer);

		this.timeInWater = 0;
		this.headHeight = 1.62;

		this.lastHealth = this.health;
	}

	public fromSave(reader:IReader) {
		super.fromSave(reader);

		this.timeInWater = reader.readShort();
	}
	
	public toSave(writer:IWriter) {
		super.toSave(writer);

		writer.writeShort(this.timeInWater == Number.MIN_SAFE_INTEGER ? 0 : this.timeInWater);
	}

	damageFrom(damage:number, entity?:IEntity) {
		super.damageFrom(damage, entity);
		if (this.health <= 0) {
			this.isDead = true;
		}

		// Send Damage Animation packet or death packet
		if (this.isDead) {
			this.sendToAllNearby(new PacketEntityStatus(this.entityId, EntityStatus.Dead).writeData());
		} else {
			this.sendToAllNearby(new PacketEntityStatus(this.entityId, EntityStatus.Hurt).writeData());
		}
	}

	isInWater(fromHead:boolean) {
		return this.world.getChunkBlockId(this.chunk, this.position.x, this.position.y + (fromHead ? this.headHeight : 0), this.position.z) === Block.waterStill.blockId;
	}

	fall(distance:number) {
		const adjustedFallDistance = Math.ceil(distance - 3);
		if (adjustedFallDistance > 0) {
			this.damageFrom(adjustedFallDistance);
		}
	}

	onTick() {
		super.onTick();

		if (!this.isPlayer && !this.motion.isZero) {
			this.moveEntity(this.motion.x, this.motion.y, this.motion.z);
		}

		// Drowning
		if (this.isInWater(true)) {
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

		if (this.isInWater(false)) {
			this.fallDistance = 0;
		}
	}
}