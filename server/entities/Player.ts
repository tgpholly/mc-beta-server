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

const CHUNK_LOAD_RANGE = 5;

export class Player extends EntityLiving {
	public username:string;
	private server:MinecraftServer;
	private firstUpdate:boolean;
	public loadedChunks:Array<number>;
	public justUnloaded:Array<number>;
	public mpClient?:MPClient;
	public inventory:Inventory;

	private lastHealth:number;

	public constructor(server:MinecraftServer, world:World, username:string) {
		super(world);
		this.server = server;
		this.firstUpdate = true;
		this.loadedChunks = new Array<number>();
		this.justUnloaded = new Array<number>();

		this.inventory = new Inventory(44, "Player Inventory");

		this.inventory.setSlotItemStack(36, new ItemStack(Block.dirt, 1));
		this.inventory.setSlotItemStack(37, new ItemStack(Block.dirt, 2));
		this.inventory.setSlotItemStack(38, new ItemStack(Block.dirt, 3));

		this.username = username;
		this.x = 8;
		this.y = 64;
		this.z = 8;

		this.lastHealth = this.health;
	}

	public forceUpdatePlayerChunks() {
		this.firstUpdate = true;
	}

	private async updatePlayerChunks() {
		const bitX = this.x >> 4;
		const bitZ = this.z >> 4;
		if (bitX != this.lastX >> 4 || bitZ != this.lastZ >> 4 || this.firstUpdate) {
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

	public onTick() {
		this.updatePlayerChunks();

		if (this.health != this.lastHealth) {
			this.lastHealth = this.health;
			this.mpClient?.send(new PacketUpdateHealth(this.health).writeData());
		}

		super.onTick();
	}
}