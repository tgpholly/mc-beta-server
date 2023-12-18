import { Chunk } from "../Chunk";
import { MPClient } from "../MPClient";
import { MinecraftServer } from "../MinecraftServer";
import { World } from "../World";
import { PacketMapChunk } from "../packets/MapChunk";
import { EntityLiving } from "./EntityLiving";
import { PacketPreChunk } from "../packets/PreChunk";
import { PacketUpdateHealth } from "../packets/UpdateHealth";
import { Inventory } from "../inventories/Inventory";
import { ItemStack } from "../inventories/ItemStack";
import { Block } from "../blocks/Block";
import PlayerInventory from "../inventories/PlayerInventory";
import { Item } from "../items/Item";
import { PacketEntityEquipment } from "../packets/EntityEquipment";
import { IReader, IWriter } from "bufferstuff";
import { EntityItem } from "./EntityItem";
import { Entity } from "./Entity";
import { PacketCollectItem } from "../packets/CollectItem";
import { PacketPickupSpawn } from "../packets/PickupSpawn";

const CHUNK_LOAD_RANGE = 15;

export class Player extends EntityLiving {
	public username:string;
	private server:MinecraftServer;
	private firstUpdate:boolean;
	public loadedChunks:Array<number>;
	public justUnloaded:Array<number>;
	public mpClient?:MPClient;
	public inventory:PlayerInventory;

	public trackedEquipment:Array<ItemStack | null>;

	public constructor(server:MinecraftServer, world:World, username:string) {
		super(world, true);
		this.server = server;
		this.firstUpdate = true;
		this.loadedChunks = new Array<number>();
		this.justUnloaded = new Array<number>();

		this.inventory = new PlayerInventory(this);

		this.inventory.setSlotItemStack(36, new ItemStack(Item.ironSword, 1));
		this.inventory.setSlotItemStack(37, new ItemStack(Item.ironPickaxe, 1));
		this.inventory.setSlotItemStack(38, new ItemStack(Item.ironShovel, 1));
		this.inventory.setSlotItemStack(39, new ItemStack(Item.ironAxe, 1));
		this.inventory.setSlotItemStack(43, new ItemStack(Block.dirt, 32));

		this.trackedEquipment = new Array<ItemStack | null>();
		for (let i = 0; i < 5; i++) {
			this.trackedEquipment.push(null);
		}

		this.username = username;
		this.position.set(8, 64, 8);
	}

	public fromSave(reader:IReader) {
		super.fromSave(reader);

		this.inventory.fromSave(reader);
	}
	
	public toSave(writer:IWriter) {
		super.toSave(writer);

		this.inventory.toSave(writer);
	}

	// Forces a player chunk update *next tick*
	public forceUpdatePlayerChunks() {
		this.firstUpdate = true;
	}

	public itemPickup(entity:Entity, stackSize:number) {
		if (!this.isDead) {
			if (entity instanceof EntityItem) {
				this.sendToAllNearby(new PacketCollectItem(entity.entityId, this.entityId).writeData());
			}
		}
	}

	dropAllItems() {
		for (const itemStack of this.inventory.itemStacks) {
			if (itemStack) {
				const item = new EntityItem(this.world, itemStack);
				item.position.set(this.position);
				this.world.addEntity(item);
			}
		}
	}

	private async updatePlayerChunks() {
		const bitX = this.position.x >> 4;
		const bitZ = this.position.z >> 4;
		if (bitX != this.lastPosition.x >> 4 || bitZ != this.lastPosition.z >> 4 || this.firstUpdate) {
			if (this.firstUpdate) {
				this.firstUpdate = false;
				// TODO: Make this based on the player's initial coords
				this.mpClient?.send(new PacketPreChunk(0, 0, true).writeData());
				const chunk = await this.world.getChunkSafe(0, 0);
				const chunkData = await (new PacketMapChunk(0, 0, 0, 15, 127, 15, chunk).writeData());
				this.mpClient?.send(chunkData);
			}

			// Load or keep any chunks we need
			const currentLoads = [];
			for (let x = bitX - CHUNK_LOAD_RANGE; x < bitX + CHUNK_LOAD_RANGE; x++) {
				for (let z = bitZ - CHUNK_LOAD_RANGE; z < bitZ + CHUNK_LOAD_RANGE; z++) {
					const coordPair = Chunk.CreateCoordPair(x, z);
					if (!this.loadedChunks.includes(coordPair)) {
						const chunk = await this.world.getChunkSafe(x, z);
						this.mpClient?.send(new PacketPreChunk(x, z, true).writeData());
						this.loadedChunks.push(coordPair);
						chunk.playersInChunk.set(this.entityId, this);
						const chunkData = await (new PacketMapChunk(x, 0, z, 15, 127, 15, chunk).writeData());
						this.mpClient?.send(chunkData);
					}
					currentLoads.push(coordPair);
				}	
			}

			// Mark any unaccounted chunks for unload
			for (const coordPair of this.loadedChunks) {
				if (!currentLoads.includes(coordPair) && this.world.chunkExists(coordPair)) {
					this.justUnloaded.push(coordPair);
					const chunkToUnload = this.world.getChunkByCoordPair(coordPair);
					this.mpClient?.send(new PacketPreChunk(chunkToUnload.x, chunkToUnload.z, false).writeData());
				}
			}

			// Overwrite loaded chunks
			this.loadedChunks = currentLoads;
		}
	}

	private getEquipmentForVirtualSlot(slot:number) {
		if (slot === 0) {
			return this.mpClient?.getHeldItemStack() ?? null;
		} else {
			this.inventory.getSlotItemStack(4 + slot); // 5 - 8
		}

		return null;
	}

	private sendEquipment(equipmentId:number, itemStack:ItemStack | null) {
		this.sendToNearby(new PacketEntityEquipment(this.entityId, equipmentId, itemStack == null ? -1 : itemStack.itemID, itemStack == null ? 0 : itemStack.damage).writeData());
	}

	private sendEquipmentPlayer(mpClient:MPClient, equipmentId:number, itemStack:ItemStack | null) {
		mpClient.send(new PacketEntityEquipment(this.entityId, equipmentId, itemStack == null ? -1 : itemStack.itemID, itemStack == null ? 0 : itemStack.damage).writeData());
	}

	// For login.
	public sendPlayerEquipment(playerToSendTo:Player) {
		const mpClient = playerToSendTo.mpClient;
		if (mpClient == null) {
			return;
		}

		for (let slotId = 0; slotId < 5; slotId++) {
			const itemStack = this.getEquipmentForVirtualSlot(slotId);
			const trackedEquipment = this.trackedEquipment[slotId];

			if ((itemStack == null || trackedEquipment == null) || !itemStack.compare(trackedEquipment)) {
				this.trackedEquipment[slotId] = itemStack;
				this.sendEquipmentPlayer(mpClient, slotId, itemStack);
			}
		}
	}

	public onTick() {
		this.updatePlayerChunks();

		// Calculate player motion since we don't have it serverside.
		this.motion.set(this.position.x - this.lastPosition.x, this.position.y - this.lastPosition.y, this.position.z - this.lastPosition.z);
		if (!this.motion.isZero) {
			this.entityAABB.move(this.position);
		}

		super.onTick();

		for (let slotId = 0; slotId < 5; slotId++) {
			const itemStack = this.getEquipmentForVirtualSlot(slotId);
			const trackedEquipment = this.trackedEquipment[slotId];

			if ((itemStack == null || trackedEquipment == null) || !itemStack.compare(trackedEquipment)) {
				this.trackedEquipment[slotId] = itemStack;
				this.sendEquipment(slotId, itemStack);
			}
		}

		if (this.health != this.lastHealth) {
			if (this.health <= 0 && this.isDead) {
				this.dropAllItems();
			}

			this.lastHealth = this.health;
			this.mpClient?.send(new PacketUpdateHealth(this.health).writeData());
		}
	}
}