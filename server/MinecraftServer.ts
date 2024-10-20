import { Config } from "../config";
import { Console } from "hsconsole";
import { createReader, IReader, Endian } from "bufferstuff";
import FunkyArray from "funky-array";
import { Server, Socket } from "net";
import { MPClient } from "./MPClient";
import { Packet } from "./enums/Packet";
import { PacketKeepAlive } from "./packets/KeepAlive";
import { PacketHandshake } from "./packets/Handshake";
import { PacketLoginRequest } from "./packets/LoginRequest";
import { PacketChat } from "./packets/Chat";
import { PacketSpawnPosition } from "./packets/SpawnPosition";
import { PacketPlayerPositionLook } from "./packets/PlayerPositionLook";
import { PacketNamedEntitySpawn } from "./packets/NamedEntitySpawn";
import { PacketDisconnectKick } from "./packets/DisconnectKick";
import { Player } from "./entities/Player";
import { SaveCompressionType } from "./enums/SaveCompressionType";
import { WorldSaveManager } from "./WorldSaveManager";
import { World } from "./World";
import { Chunk } from "./Chunk";
import { PacketTimeUpdate } from "./packets/TimeUpdate";
import { HillyGenerator } from "./generators/Hilly";
import { NetherGenerator } from "./generators/Nether";
import { PacketWindowItems } from "./packets/WindowItems";
import { getRandomValues } from "crypto";
import { NewOverworld } from "./generators/NewOverworld";

const chunkFrom = -15;
const chunkTo = 15;
const chunkCount = Math.abs(chunkFrom * 2) * (chunkTo * 2);

function getRandomSeed() {
	const arr = new Uint32Array(1);
	return getRandomValues(arr)[0];
}

export class MinecraftServer {
	private static readonly PROTOCOL_VERSION = 14;
	private static readonly TICK_RATE = 20;
	private static readonly TICK_RATE_MS = 1000 / MinecraftServer.TICK_RATE;
	private readonly keepalivePacket = new PacketKeepAlive().writeData();

	private config:Config;
	private server:Server;
	private readonly serverClock:NodeJS.Timeout;
	private tickCounter:number = 0;
	private clients:FunkyArray<string, MPClient>;
	public worlds:FunkyArray<number, World>;
	public saveManager:WorldSaveManager;

	// https://stackoverflow.com/a/7616484
	// Good enough for the world seed.
	private hashCode(string:string) : number {
		let hash = 0, i, chr;
		if (string.length === 0) {
			return hash;
		}
		for (i = 0; i < string.length; i++) {
			chr = string.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0;
		}
		return hash;
	}

	public constructor(config:Config) {
		this.config = config;

		let shuttingDown = false;
		process.on("SIGINT", async (signal) => {
			if (shuttingDown) {
				return;
			}
			shuttingDown = true;
			Console.printInfo("Shutting down...");
			// Stop the server timer
			clearInterval(this.serverClock);
			// Disconnect all players
			const kickPacket = new PacketDisconnectKick("Server shutting down.").writeData();
			this.sendToAllClients(kickPacket);
			// Shut down the tcp server
			this.server.close();
			// Save chunks
			Console.printInfo("Saving worlds...");
			// There's a race condition here. oops.
			let savedWorldCount = 0;
			let savedChunkCount = 0;
			await this.worlds.forEach(async (world) => {
				if (world.chunks.length !== 0) {
					await world.chunks.forEach(async (chunk) => {
						await world.unloadChunk(Chunk.CreateCoordPair(chunk.x, chunk.z));
						savedChunkCount++;
					});
				}
				savedWorldCount++;
			});
			Console.printInfo(`Saved ${savedChunkCount} chunks from ${savedWorldCount} world(s).`);

			// Flush final console log to disk and close all writers
			Console.cleanup();

			// hsconsole is gone now so we have to use built in.
			console.log("Goodbye");
		});

		if (this.config.saveCompression === SaveCompressionType.NONE) {
			Console.printWarn("=============- WARNING -=============");
			Console.printWarn(" Chunk compression is disabled. This");
			Console.printWarn(" will lead to large file sizes!");
			Console.printWarn("=====================================");
		}

		this.clients = new FunkyArray<string, MPClient>();

		// Convert seed if needed
		let worldSeed = typeof(this.config.seed) === "string" ? this.hashCode(this.config.seed) : typeof(this.config.seed) === "number" ? this.config.seed : getRandomSeed();

		// Init save manager and load seed from it if possible
		this.saveManager = new WorldSaveManager(this.config, [0, -1], worldSeed);
		if (this.saveManager.worldSeed !== Number.MIN_VALUE) {
			worldSeed = this.saveManager.worldSeed;
		}

		this.worlds = new FunkyArray<number, World>();
		//this.worlds.set(0, new World(this.saveManager, 0, worldSeed, new NewOverworld(worldSeed)));
		this.worlds.set(0, new World(this.saveManager, 0, worldSeed, new HillyGenerator(worldSeed)));
		this.worlds.set(-1, new World(this.saveManager, -1, worldSeed, new NetherGenerator(worldSeed)));
		
		(async () => {
			const generateStartTime = Date.now();
			let timer = Date.now();

			await this.worlds.forEach(async world => {
				timer = Date.now();
				let chunksGenerated = 0;
				let chunksPerSecond = 0;
				Console.printInfo(`Generating spawn area for DIM${world.dimension}...`);
				for (let x = chunkFrom; x < chunkTo; x++) {
					for (let z = chunkFrom; z < chunkTo; z++) {
						const chunk = await world.getChunkSafe(x, z);
						chunk.forceLoaded = true;
						chunksGenerated++;
						chunksPerSecond++;
						if (Date.now() - timer >= 1000) {
							Console.printInfo(`DIM${world.dimension} Progress [${chunksGenerated}/${chunkCount}] (${chunksPerSecond} chunks/s) ${((chunksGenerated / chunkCount) * 100).toFixed(2)}%`);
							timer = Date.now();
							chunksPerSecond = 0;
						}
					}
				}
			});
			Console.printInfo(`Done! Took ${Date.now() - generateStartTime}ms`);
			this.initServer();
		}).bind(this)();

		const timeUpdate = new PacketTimeUpdate(BigInt(this.tickCounter));
		this.serverClock = setInterval(() => {
			// Every 1 sec
			if (this.tickCounter % MinecraftServer.TICK_RATE === 0)  {
				if (this.clients.length !== 0) {
					timeUpdate.time = BigInt(this.tickCounter);
					const timePacket = timeUpdate.writeData();
					this.clients.forEach(client => {
						// Keep the client happy
						client.send(this.keepalivePacket);
						client.send(timePacket);
					});
				}

				// const memoryUsage = process.memoryUsage();
				// console.log(`Memory Usage: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(1)}MB / ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(1)}MB  ArrayBuffers: ${(memoryUsage.arrayBuffers / 1024 / 1024).toFixed(1)}MB`);
			}

			this.worlds.forEach(world => {
				world.tick();
			});
			this.tickCounter++;
		}, MinecraftServer.TICK_RATE_MS);

		this.server = new Server();
		this.server.on("connection", this.onConnection.bind(this));
	}

	initServer() {
		this.server.listen(this.config.port, () => Console.printInfo(`Minecraft server started at ${this.config.port}`));
	}

	sendToAllClients(buffer:Buffer) {
		this.clients.forEach(client => {
			client.send(buffer);
		});
	}

	sendChatMessage(text:string) {
		this.sendToAllClients(new PacketChat(text).writeData());
		Console.printInfo(`[CHAT] ${text}`);
	}

	async handleLoginRequest(reader:IReader, socket:Socket, setMPClient:(mpclient:MPClient) => void) {
		const loginPacket = new PacketLoginRequest().readData(reader);
		if (loginPacket.protocolVersion !== MinecraftServer.PROTOCOL_VERSION) {
			if (loginPacket.protocolVersion > MinecraftServer.PROTOCOL_VERSION) {
				socket.write(new PacketDisconnectKick("Outdated server!").writeData());
			} else {
				socket.write(new PacketDisconnectKick("Outdated or modded client!").writeData());
			}
			return;
		}
		
		const dimension = 0;
		const world = this.worlds.get(dimension);
		if (world instanceof World) {
			const clientEntity = new Player(this, world, loginPacket.username);
			if (this.saveManager.playerDataOnDisk.includes(clientEntity.username)) {
				clientEntity.fromSave(await this.saveManager.readPlayerDataFromDisk(clientEntity.username));
			} else {
				clientEntity.position.set(8, 70, 8);
			}
			world.addEntity(clientEntity);

			const client = new MPClient(this, socket, clientEntity);
			setMPClient(client);
			clientEntity.mpClient = client;
			this.clients.set(loginPacket.username, client);

			this.sendChatMessage(`\u00a7e${loginPacket.username} joined the game`);

			socket.write(new PacketLoginRequest(clientEntity.entityId, "", 0, dimension).writeData());
			socket.write(new PacketSpawnPosition(8, 64, 8).writeData());

			const thisPlayerSpawn = new PacketNamedEntitySpawn(clientEntity.entityId, clientEntity.username, clientEntity.absPosition.x, clientEntity.absPosition.y, clientEntity.absPosition.z, clientEntity.absRotation.yaw, clientEntity.absRotation.pitch, clientEntity.mpClient?.getHeldItemStack()?.itemID).writeData();
			world.players.forEach(player => {
				if (player.entityId !== clientEntity.entityId && clientEntity.distanceTo(player) < World.ENTITY_MAX_SEND_DISTANCE) {
					// Inform the joining player of the players around them
					socket.write(new PacketNamedEntitySpawn(player.entityId, player.username, player.absPosition.x, player.absPosition.y, player.absPosition.z, player.absRotation.yaw, player.absRotation.pitch, player.mpClient?.getHeldItemStack()?.itemID).writeData());
					player.sendPlayerEquipment(clientEntity);

					// Inform players around the joining player of the joined player
					player.mpClient?.send(thisPlayerSpawn);
					clientEntity.sendPlayerEquipment(player);
				}
			});

			socket.write(new PacketPlayerPositionLook(clientEntity.position.x, clientEntity.position.y, clientEntity.position.y + 0.62, clientEntity.position.z, 0, 0, false).writeData());

			const playerInventory = clientEntity.inventory;
			socket.write(new PacketWindowItems(0, playerInventory.getInventorySize(), playerInventory.constructInventoryPayload()).writeData());
		} else {
			socket.write(new PacketDisconnectKick("Failed to find world to put player in.").writeData());
		}
	}
	
	handleHandshake(reader:IReader, socket:Socket) {
		const handshakePacket = new PacketHandshake().readData(reader);
		socket.write(handshakePacket.writeData());
	}

	onConnection(socket:Socket) {
		let mpClient:MPClient;
		const setMPClient = (mpclient:MPClient) => {
			mpClient = mpclient;
		}

		const playerDisconnect = (err:Error) => {
			mpClient.entity.world.removeEntity(mpClient.entity);
			this.clients.remove(mpClient.entity.username);
			this.sendChatMessage(`\u00a7e${mpClient.entity.username} left the game`);
			if (typeof(err) !== "boolean") {
				Console.printError(`Client disconnected with error: ${err.message}`);
			}
		}
		socket.on("close", playerDisconnect.bind(this));
		socket.on("error", playerDisconnect.bind(this));

		socket.on("data", chunk => {
			const reader = createReader(Endian.BE, chunk);

			// Let mpClient take over if it exists
			if (mpClient instanceof MPClient) {
				mpClient.handlePacket(reader);
				return;
			}

			const packetId = reader.readUByte();
			switch (packetId) {
				// TODO: Handle timeouts at some point, idk.
				case Packet.KeepAlive: break;
				case Packet.LoginRequest: this.handleLoginRequest(reader, socket, setMPClient.bind(this)); break;
				case Packet.Handshake: this.handleHandshake(reader, socket); break;
			}
		});
	}
}