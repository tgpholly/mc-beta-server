import { Endian, IReader, IWriter, createWriter } from "bufferstuff";
import AABB from "../AABB";
import { Chunk } from "../Chunk";
import { MetadataEntry, MetadataWriter } from "../MetadataWriter";
import { Rotation } from "../Rotation";
import { Vec2 } from "../Vec2";
import Vec3 from "../Vec3";
import { World } from "../World";
import { Block } from "../blocks/Block";
import { MetadataFieldType } from "../enums/MetadataFieldType";
import { PacketEntityLook } from "../packets/EntityLook";
import { PacketEntityLookRelativeMove } from "../packets/EntityLookRelativeMove";
import { PacketEntityMetadata } from "../packets/EntityMetadata";
import { PacketEntityRelativeMove } from "../packets/EntityRelativeMove";
import { PacketEntityTeleport } from "../packets/EntityTeleport";
import { PacketEntityVelocity } from "../packets/EntityVelocity";
import { IEntity } from "./IEntity";
import { Player } from "./Player";

export class Entity implements IEntity {
	public static nextEntityId:number = 0;

	public entityId:number;

	public entitySize:Vec2;

	public world:World;

	public position:Vec3;
	public lastPosition:Vec3;
	public absPosition:Vec3;
	public lastAbsPosition:Vec3;
	public motion:Vec3;

	private moveEntityBlockPosRel:Vec3;

	public rotation:Rotation;
	public lastRotation:Rotation;
	public absRotation:Rotation;
	public lastAbsRotation:Rotation;

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

	public entityAABB:AABB;

	public readonly isPlayer:boolean;
	private queuedChunkUpdate:boolean;

	public markedForDisposal:boolean = false;

	public constructor(world:World, isPlayer:boolean = false) {
		this.entityId = Entity.nextEntityId++;

		this.isPlayer = isPlayer;

		this.entitySize = new Vec2(0.6, 1.8);
		this.entityAABB = new AABB(-this.entitySize.x / 2, 0, -this.entitySize.x / 2, this.entitySize.x / 2, this.entitySize.y, this.entitySize.x / 2);
		
		this.fire = this.fallDistance = 0;
		this.onGround = false;

		this.world = world;

		this.position = new Vec3();
		this.lastPosition = new Vec3();
		this.absPosition = new Vec3();
		this.lastAbsPosition = new Vec3();
		this.motion = new Vec3();

		this.moveEntityBlockPosRel = new Vec3();

		this.rotation = new Rotation();
		this.lastRotation = new Rotation();
		this.absRotation = new Rotation();
		this.lastAbsRotation = new Rotation();

		this.crouching = this.lastCrouchState = this.lastFireState = this.queuedChunkUpdate = false;

		this.chunk = world.getChunk(this.position.x >> 4, this.position.z >> 4);

		this.health = 20;
		this.wasHurt = false;
		this.isDead = false;
	}

	public fromSave(reader:IReader) {
		this.position.set(reader.readDouble(), reader.readDouble(), reader.readDouble());
		this.motion.set(reader.readFloat(), reader.readFloat(), reader.readFloat());
		this.rotation.set(reader.readFloat(), reader.readFloat());
		this.fire = reader.readShort();
		this.fallDistance = reader.readFloat();
		this.health = reader.readByte();
	}

	public toSave(writer:IWriter) {
		writer.writeDouble(this.position.x).writeDouble(this.position.y).writeDouble(this.position.z) // Position
			  .writeFloat(this.motion.x).writeFloat(this.motion.y).writeFloat(this.motion.z) // Motion
			  .writeFloat(this.rotation.x).writeFloat(this.rotation.y) // Rotation
			  .writeShort(this.fire)
			  .writeFloat(this.fallDistance)
			  .writeByte(this.health);
	}

	async collidesWithPlayer(aabb:AABB) {
		let collidedWith:Player | undefined;
		await this.world.players.forEach(player => {
			if (this.entityAABB.intersects(player.entityAABB) && collidedWith == undefined) {
				collidedWith = player;
			}
		});

		return collidedWith;
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
		} else {
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

	kill() {
		this.health = 0;
		this.markedForDisposal = true;
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

	private getBlockAABBFor(x:number, y:number, z:number) {
		const blockId = this.chunk.getBlockId(x, y, z);
		const blockEntityIsTouching = blockId > 0 ? Block.blocks[blockId] : null;

		if (blockEntityIsTouching != null) {
			return blockEntityIsTouching.getBoundingBox(Math.floor(this.position.x), Math.floor(this.position.y), Math.floor(this.position.z));
		}

		return null;
	}

	moveEntity(motionX:number, motionY:number, motionZ:number) {
		this.position.add(motionX, motionY, motionZ);
		this.entityAABB.move(this.position);

		let blockAABB = this.getBlockAABBFor(Math.floor(this.position.x) & 0xf, Math.floor(this.position.y), Math.floor(this.position.z) & 0xf);

		if (blockAABB !== null) {
			this.moveEntityBlockPosRel.set(this.position);
			this.moveEntityBlockPosRel.sub(Math.floor(this.position.x), Math.floor(this.position.y), Math.floor(this.position.z));
	
			// TODO: Handle X and Z collisions.
			if (this.entityAABB.intersects(blockAABB)) {
				const intersectionY = this.entityAABB.intersectionY(blockAABB);
				if (this.moveEntityBlockPosRel.y > 0.5) {
					motionY = intersectionY;
				} else {
					motionY = -intersectionY;
				}
			}

			this.position.add(0, motionY, 0);
			this.motion.y = 0;
			this.onGround = true;
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