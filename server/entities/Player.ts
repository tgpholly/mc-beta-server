import { Chunk } from "../Chunk";
import { MPClient } from "../MPClient";
import { MinecraftServer } from "../MinecraftServer";
import { World } from "../World";
import { PacketMapChunk } from "../packets/MapChunk";
import { EntityLiving } from "./EntityLiving";
import { PacketPreChunk } from "../packets/PreChunk";

export class Player extends EntityLiving {
	public username:string;
	private server:MinecraftServer;
	private firstUpdate:boolean;
	public loadedChunks:Array<number>;
	public justUnloaded:Array<number>;
	public mpClient?:MPClient;

	public constructor(server:MinecraftServer, world:World, username:string) {
		super(world);
		this.server = server;
		this.firstUpdate = true;
		this.loadedChunks = new Array<number>();
		this.justUnloaded = new Array<number>();

		this.username = username;
		this.x = 8;
		this.y = 64;
		this.z = 8;
	}

	onTick() {
		const bitX = this.x >> 4;
		const bitZ = this.z >> 4;
		if (bitX != this.lastX >> 4 || bitZ != this.lastZ >> 4 || this.firstUpdate) {
			if (this.firstUpdate) {
				this.firstUpdate = false;
				this.mpClient?.send(new PacketPreChunk(0, 0, true).writeData());
				const chunk = this.world.getChunk(0, 0);
				(async () => {
					const chunkData = await (new PacketMapChunk(0, 0, 0, 15, 127, 15, chunk).writeData());
					this.mpClient?.send(chunkData);
				})();
			}

			// Load or keep any chunks we need
			const currentLoads = [];
			for (let x = bitX - 6; x < bitX + 6; x++) {
				for (let z = bitZ - 6; z < bitZ + 6; z++) {
					const coordPair = Chunk.CreateCoordPair(x, z);
					if (!this.loadedChunks.includes(coordPair)) {
						const chunk = this.world.getChunk(x, z);
						this.mpClient?.send(new PacketPreChunk(x, z, true).writeData());
						this.loadedChunks.push(coordPair);
						chunk.playersInChunk.set(this.entityId, this);
						(async () => {
							const chunkData = await (new PacketMapChunk(x, 0, z, 15, 127, 15, chunk).writeData());
							this.mpClient?.send(chunkData);
						})();
					}
					currentLoads.push(coordPair);
				}	
			}

			// Mark any unaccounted chunks for unload
			for (const coordPair of this.loadedChunks) {
				if (!currentLoads.includes(coordPair)) {
					this.justUnloaded.push(coordPair);
					const chunkToUnload = this.world.getChunkByCoordPair(coordPair);
					this.mpClient?.send(new PacketPreChunk(chunkToUnload.x, chunkToUnload.z, false).writeData());
				}
			}

			// Overwrite loaded chunks
			this.loadedChunks = currentLoads;
		}

		super.onTick();
	}
}