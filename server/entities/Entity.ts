import { Chunk } from "../Chunk";
import { MetadataEntry, MetadataWriter } from "../MetadataWriter";
import { World } from "../World";
import { MetadataFieldType } from "../enums/MetadataFieldType";
import { PacketEntityMetadata } from "../packets/EntityMetadata";
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

	public health:number;

	public fire:number;

	public chunk:Chunk;

	public crouching:boolean;
	private lastCrouchState:boolean;
	private lastFireState:boolean;

	private queuedChunkUpdate:boolean;

	public constructor(world:World) {
		this.entityId = Entity.nextEntityId++;
		
		this.fire = 0;

		this.world = world;
		this.x = this.y = this.z = this.lastX = this.lastY = this.lastZ = 0;
		this.crouching = this.lastCrouchState = this.lastFireState = this.queuedChunkUpdate = false;

		this.chunk = world.getChunk(this.x >> 4, this.z >> 4);

		this.health = 20;
	}

	sendToNearby(buffer:Buffer) {
		this.world.sendToNearbyClients(this, buffer);
	}

	sendToAllNearby(buffer:Buffer) {
		this.world.sendToNearbyClients(this, buffer);
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
			//metadata.addMetadataEntry(0, new MetadataEntry(MetadataFieldType.Byte, 1));
			if (crouchStateChanged) {
				metadata.addMetadataEntry(0, new MetadataEntry(MetadataFieldType.Byte, Number(this.fire > 0) + Number(this.crouching) * 2));
			}

			this.sendToNearby(new PacketEntityMetadata(this.entityId, metadata.writeBuffer()).writeData());

			this.lastCrouchState = this.crouching;
			this.lastFireState = this.fire > 0;
		}
	}

	distanceTo(entity:IEntity) {
		const dX = entity.x - this.x,
			  dY = entity.y - this.y,
			  dZ = entity.z - this.z;
			  
		return Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2) + Math.pow(dZ, 2));
	}

	damageFrom(damage:number, entity?:IEntity) {
		if (this.health <= 0) {
			return;
		}

		if (entity === undefined) {
			this.health -= damage;
		}
	}

	updateEntityChunk() {
		const bitX = this.x >> 4;
		const bitZ = this.z >> 4;
		if (bitX != this.lastX >> 4 || bitZ != this.lastZ >> 4 || this.queuedChunkUpdate) {
			if (this.world.chunkExists(bitX, bitZ)) {
				this.chunk = this.world.getChunk(bitX, bitZ);
				this.queuedChunkUpdate = false;
			} else {
				this.queuedChunkUpdate = true;
			}
		}
	}

	onTick() {
		this.updateMetadata();
		this.updateEntityChunk();

		if (this.fire > 0) {
			if (this.fire % 20 === 0) {
				this.damageFrom(1);
			}
			
			this.fire--;
		}

		this.lastX = this.x;
		this.lastY = this.y;
		this.lastZ = this.z;
	}
}