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
	public yaw:number;
	public lastYaw:number;
	public pitch:number;
	public lastPitch:number;
	public onGround:boolean;
	public fallDistance:number;
	public timeInWater:number;
	public headHeight:number;

	public absX:number;
	public absY:number;
	public absZ:number;
	public absYaw:number;
	public absPitch:number;
	public lastAbsX:number;
	public lastAbsY:number;
	public lastAbsZ:number;
	public lastAbsYaw:number;
	public lastAbsPitch:number;

	public constructor(world:World) {
		super(world);

		this.fallDistance = this.yaw = this.lastYaw = this.pitch = this.lastPitch = this.absX = this.absY = this.absZ = this.absYaw = this.absPitch = this.lastAbsX = this.lastAbsY = this.lastAbsZ = this.lastAbsYaw = this.lastAbsPitch = this.timeInWater = 0;
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
		return this.world.getChunkBlockId(this.chunk, this.x, this.y + this.headHeight, this.z) === Block.waterStill.blockId;
	}

	private constrainRot(rot:number) {
		return Math.min(Math.max(rot, -128), 127);
	}

	private sendPositionUpdate() {
		this.absX = Math.floor(this.x * 32);
		this.absY = Math.floor(this.y * 32);
		this.absZ = Math.floor(this.z * 32);
		// This is suuuuuper jank
		this.absYaw = this.constrainRot(Math.floor(((this.yaw - 180 >= 0 ? this.yaw - 180 : (this.yaw - 180) % 360 + 360) % 360 / 360) * 256) - 128);
		this.absPitch = this.constrainRot(Math.floor((this.pitch % 360 * 256) / 360));
		const diffX = this.absX - this.lastAbsX;
		const diffY = this.absY - this.lastAbsY;
		const diffZ = this.absZ - this.lastAbsZ;
		const diffYaw = this.absYaw - this.lastAbsYaw;
		const diffPitch = this.absPitch - this.lastAbsPitch;

		const doRelativeMove = Math.abs(diffX) >= 4 || Math.abs(diffY) >= 4 || Math.abs(diffZ) >= 4;
		const doLook = Math.abs(diffYaw) >= 4 || Math.abs(diffPitch) >= 4;
		if (Math.abs(diffX) > 128 || Math.abs(diffY) > 128 || Math.abs(diffZ) > 128) {
			this.world.sendToNearbyClients(this, new PacketEntityTeleport(this.entityId, this.absX, this.absY, this.absZ, this.absYaw, this.absPitch).writeData());
		} else if (doRelativeMove && doLook) {
			this.world.sendToNearbyClients(this, new PacketEntityLookRelativeMove(this.entityId, diffX, diffY, diffZ, this.absYaw, this.absPitch).writeData());
		} else if (doRelativeMove) {
			this.world.sendToNearbyClients(this, new PacketEntityRelativeMove(this.entityId, diffX, diffY, diffZ).writeData());
		} else if (doLook) {
			this.world.sendToNearbyClients(this, new PacketEntityLook(this.entityId, this.absYaw, this.absPitch).writeData());
		}

		if (doRelativeMove) {
			this.lastAbsX = this.absX;
			this.lastAbsY = this.absY;
			this.lastAbsZ = this.absZ;
		}
		if (doLook) {
			this.lastAbsYaw = this.absYaw;
			this.lastAbsPitch = this.absPitch;
		}
	}

	onTick() {
		super.onTick();
		this.sendPositionUpdate();

		if (!this.onGround) {
			this.fallDistance
		}

		// Drowning
		if (this.isInWater()) {
			console.log("in water!");
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

		this.lastYaw = this.yaw;
		this.lastPitch = this.pitch;
	}
}