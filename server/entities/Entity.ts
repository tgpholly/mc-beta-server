import { Chunk } from "../Chunk";
import { MetadataEntry, MetadataWriter } from "../MetadataWriter";
import { Rotation } from "../Rotation";
import { Vec3 } from "../Vec3";
import { World } from "../World";
import { MetadataFieldType } from "../enums/MetadataFieldType";
import { PacketEntityLook } from "../packets/EntityLook";
import { PacketEntityLookRelativeMove } from "../packets/EntityLookRelativeMove";
import { PacketEntityMetadata } from "../packets/EntityMetadata";
import { PacketEntityRelativeMove } from "../packets/EntityRelativeMove";
import { PacketEntityTeleport } from "../packets/EntityTeleport";
import { PacketEntityVelocity } from "../packets/EntityVelocity";
import { IEntity } from "./IEntity";

export class Entity implements IEntity {
	public static nextEntityId:number = 0;

	public entityId:number;

	public world:World;

	public position:Vec3;
	public lastPosition:Vec3;
	public absPosition:Vec3;
	public lastAbsPosition:Vec3;
	public motion:Vec3;

	public rotation:Rotation;
	public lastRotation:Rotation;
	public absRotation:Rotation;
	public lastAbsRotation:Rotation;

	public velocity:Vec3;

	public health:number;
	public wasHurt:boolean;
	public isDead:boolean;

	public fire:number;
	public fallDistance:number;

	public onGround:boolean;

	public chunk:Chunk;

	public crouching:boolean;
	private lastCrouchState:boolean;
	private lastFireState:boolean;

	private queuedChunkUpdate:boolean;

	public constructor(world:World) {
		this.entityId = Entity.nextEntityId++;
		
		this.fire = this.fallDistance = 0;
		this.onGround = false;

		this.world = world;

		this.position = new Vec3();
		this.lastPosition = new Vec3();
		this.absPosition = new Vec3();
		this.lastAbsPosition = new Vec3();
		this.motion = new Vec3();

		this.rotation = new Rotation();
		this.lastRotation = new Rotation();
		this.absRotation = new Rotation();
		this.lastAbsRotation = new Rotation();

		this.velocity = new Vec3();

		this.crouching = this.lastCrouchState = this.lastFireState = this.queuedChunkUpdate = false;

		this.chunk = world.getChunk(this.position.x >> 4, this.position.z >> 4);

		this.health = 20;
		this.wasHurt = false;
		this.isDead = false;
	}

	sendToNearby(buffer:Buffer) {
		this.world.sendToNearbyClients(this, buffer);
	}

	sendToAllNearby(buffer:Buffer) {
		this.world.sendToNearbyAllNearbyClients(this, buffer);
	}

	updateMetadata() {
		const crouchStateChanged = this.crouching !== this.lastCrouchState;
		const fireStateChanged = this.fire > 0 !== this.lastFireState;
		if (crouchStateChanged || fireStateChanged) {
			const metadata = new MetadataWriter();
			// Flags:
			// 1 = On Fire
			// 2 = Player crouched
			// 4 = Player on mount?
			metadata.addMetadataEntry(0, new MetadataEntry(MetadataFieldType.Byte, Number(this.fire > 0) + Number(this.crouching) * 2));

			this.sendToNearby(new PacketEntityMetadata(this.entityId, metadata.writeBuffer()).writeData());

			this.lastCrouchState = this.crouching;
			this.lastFireState = this.fire > 0;
		}
	}

	distanceTo(entity:IEntity) {
		const dX = entity.position.x - this.position.x,
			  dY = entity.position.y - this.position.y,
			  dZ = entity.position.z - this.position.z;
			  
		return Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2) + Math.pow(dZ, 2));
	}

	damageFrom(damage:number, entity?:IEntity) {
		if (this.health <= 0) {
			return;
		}

		if (entity === undefined) {
			this.health -= damage;
		}

		this.wasHurt = true;
	}

	updateEntityChunk() {
		const bitX = this.position.x >> 4;
		const bitZ = this.position.z >> 4;
		if (bitX != this.lastPosition.x >> 4 || bitZ != this.lastPosition.z >> 4 || this.queuedChunkUpdate) {
			if (this.world.chunkExists(bitX, bitZ)) {
				this.chunk = this.world.getChunk(bitX, bitZ);
				this.queuedChunkUpdate = false;
			} else {
				this.queuedChunkUpdate = true;
			}
		}
	}

	private constrainRot(rot:number) {
		return Math.min(Math.max(rot, -128), 127);
	}

	private sendPositionUpdate() {
		this.absPosition.set(Math.floor(this.position.x * 32), Math.floor(this.position.y * 32), Math.floor(this.position.z * 32));

		// This code *does* work, and it works well. But this is absolutely TERRIBLE!
		// There is definitely a better way to do this.
		this.absRotation.set(
			this.constrainRot(Math.floor(((this.rotation.yaw - 180 >= 0 ? this.rotation.yaw - 180 : (this.rotation.yaw - 180) % 360 + 360) % 360 / 360) * 256) - 128), // Yaw
			this.constrainRot(Math.floor((this.rotation.pitch % 360 * 256) / 360)) // Pitch
		);
		const diffX = this.absPosition.x - this.lastAbsPosition.x;
		const diffY = this.absPosition.y - this.lastAbsPosition.y;
		const diffZ = this.absPosition.z - this.lastAbsPosition.z;
		const diffYaw = this.absRotation.yaw - this.lastAbsRotation.yaw;
		const diffPitch = this.absRotation.pitch - this.lastAbsRotation.pitch;

		const doRelativeMove = Math.abs(diffX) >= 4 || Math.abs(diffY) >= 4 || Math.abs(diffZ) >= 4;
		const doLook = Math.abs(diffYaw) >= 4 || Math.abs(diffPitch) >= 4;
		if (Math.abs(diffX) > 128 || Math.abs(diffY) > 128 || Math.abs(diffZ) > 128) {
			this.sendToNearby(new PacketEntityTeleport(this.entityId, this.absPosition.x, this.absPosition.y, this.absPosition.z, this.absRotation.yaw, this.absRotation.pitch).writeData());
		} else if (doRelativeMove && doLook) {
			this.sendToNearby(new PacketEntityLookRelativeMove(this.entityId, diffX, diffY, diffZ, this.absRotation.yaw, this.absRotation.pitch).writeData());
		} else if (doRelativeMove) {
			this.sendToNearby(new PacketEntityRelativeMove(this.entityId, diffX, diffY, diffZ).writeData());
		} else if (doLook) {
			this.sendToNearby(new PacketEntityLook(this.entityId, this.absRotation.yaw, this.absRotation.pitch).writeData());
		}

		if (!this.motion.isZero) {
			this.sendToNearby(new PacketEntityVelocity(this.entityId, this.motion.x, this.motion.y, this.motion.z).writeData());
		}

		if (doRelativeMove) {
			this.lastAbsPosition.set(this.absPosition);
		}
		if (doLook) {
			this.lastAbsRotation.set(this.absRotation);
		}
	}

	fall(distance:number) {
		// TODO: Entity falling mount transfer
	}

	updateFalling(distance:number) {
		if (this.onGround) {
            if (this.fallDistance > 0) {
                this.fall(this.fallDistance);
                this.fallDistance = 0;
            }
        } else if (distance < 0) {
            this.fallDistance -= distance;
        }
	}

	onTick() {
		this.updateMetadata();
		this.updateEntityChunk();
		this.updateFalling(this.motion.y);

		if (this.fire > 0) {
			if (this.fire % 20 === 0) {
				this.damageFrom(1);
			}
			
			this.fire--;
		}

		if (!this.isDead && this.health <= 0) {
			this.isDead = true;

		}

		if (this.wasHurt) {
			this.wasHurt = false;
		}

		this.sendPositionUpdate();

		this.lastPosition.set(this.position);
	}
}