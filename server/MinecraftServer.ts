import { Config } from "../config";
import { Console } from "../console";
import { Server, Socket, SocketAddress } from "net";
import { FunkyArray } from "../funkyArray";
import { World } from "./World";
import { Reader } from "../bufferStuff";
import { Packets } from "./enums/Packets";
import { PacketHandshake } from "./packets/Handshake";
import { MPClient } from "./MPClient";
import { PacketKeepAlive } from "./packets/KeepAlive";
import { PacketLoginRequest } from "./packets/LoginRequest";
import { PacketDisconnectKick } from "./packets/DisconnectKick";
import { Player } from "./entities/Player";
import { PacketSpawnPosition } from "./packets/SpawnPosition";
import { PacketPlayerPositionLook } from "./packets/PlayerPositionLook";
import { PacketChat } from "./packets/Chat";
import { PacketNamedEntitySpawn } from "./packets/NamedEntitySpawn";

export class MinecraftServer {
	private static readonly PROTOCOL_VERSION = 14;
	private static readonly TICK_RATE = 20;
	private static readonly TICK_RATE_MS = 1000 / MinecraftServer.TICK_RATE;
	private readonly keepalivePacket = new PacketKeepAlive().writeData();

	private config:Config;
	private server:Server;
	private readonly serverClock:NodeJS.Timer;
	private tickCounter:number = 0;
	private clients:FunkyArray<string, MPClient>;
	private worlds:FunkyArray<number, World>;
	private overworld:World;

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

		this.clients = new FunkyArray<string, MPClient>();

		// Convert seed if needed
		const worldSeed = typeof(this.config.seed) === "string" ? this.hashCode(this.config.seed) : this.config.seed;

		this.worlds = new FunkyArray<number, World>();
		this.worlds.set(0, this.overworld = new World(worldSeed));

		// Generate spawn area (overworld)
		const generateStartTime = Date.now();
		Console.printInfo("[Overworld] Generating spawn area...");
		let generatedCount = 0;
		for (let x = -3; x < 3; x++) {
			for (let z = -3; z < 3; z++) {
				this.overworld.getChunk(x, z);
				if (generatedCount++ % 5 === 0) {
					Console.printInfo(`[Overworld] Generating spawn area... ${Math.floor(generatedCount / 36 * 100)}%`);
				}
			}	
		}
		Console.printInfo(`Done! Took ${Date.now() - generateStartTime}ms`);

		this.serverClock = setInterval(() => {
			// Every 1 sec
			if (this.tickCounter % MinecraftServer.TICK_RATE === 0)  {
				if (this.clients.length !== 0) {
					this.clients.forEach(client => {
						client.send(this.keepalivePacket);
					});
				}
			}

			this.worlds.forEach(world => {
				world.tick();
			});
			this.tickCounter++;
		}, MinecraftServer.TICK_RATE_MS);

		this.server = new Server();
		this.server.on("connection", this.onConnection.bind(this));
		this.server.listen(config.port, () => Console.printInfo(`Minecraft server started at ${config.port}`));
	}

	sendToAllClients(buffer:Buffer) {
		this.clients.forEach(client => {
			client.send(buffer);
		});
	}

	handleLoginRequest(reader:Reader, socket:Socket, setMPClient:(mpclient:MPClient) => void) {
		const loginPacket = new PacketLoginRequest().readData(reader);
		if (loginPacket.protocolVersion !== MinecraftServer.PROTOCOL_VERSION) {
			if (loginPacket.protocolVersion > MinecraftServer.PROTOCOL_VERSION) {
				socket.write(new PacketDisconnectKick("Outdated server!").writeData());
			} else {
				socket.write(new PacketDisconnectKick("Outdated or modded client!").writeData());
			}
			return;
		}
		
		const world = this.worlds.get(0);
		if (world instanceof World) {
			const clientEntity = new Player(this, world, loginPacket.username);
			world.addEntity(clientEntity);

			const client = new MPClient(this, socket, clientEntity);
			setMPClient(client);
			clientEntity.mpClient = client;
			this.clients.set(loginPacket.username, client);

			this.sendToAllClients(new PacketChat(`\u00a7e${loginPacket.username} joined the game`).writeData());

			socket.write(new PacketLoginRequest(clientEntity.entityId, "", 0, 0).writeData());
			socket.write(new PacketSpawnPosition(8, 64, 8).writeData());

			const thisPlayerSpawn = new PacketNamedEntitySpawn(clientEntity.entityId, clientEntity.username, clientEntity.absX, clientEntity.absY, clientEntity.absZ, clientEntity.absYaw, clientEntity.absPitch, 0).writeData();
			world.players.forEach(player => {
				if (player.entityId !== clientEntity.entityId && clientEntity.distanceTo(player) < World.ENTITY_MAX_SEND_DISTANCE) {
					socket.write(new PacketNamedEntitySpawn(player.entityId, player.username, player.absX, player.absY, player.absZ, player.absYaw, player.absPitch, 0).writeData());
					player.mpClient?.send(thisPlayerSpawn);
				}
			});

			socket.write(new PacketPlayerPositionLook(8, 70, 70.62, 8, 0, 0, false).writeData());
		} else {
			socket.write(new PacketDisconnectKick("Failed to find world to put player in.").writeData());
		}
	}
	
	handleHandshake(reader:Reader, socket:Socket) {
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
			this.sendToAllClients(new PacketChat(`\u00a7e${mpClient.entity.username} left the game`).writeData());
			if (typeof(err) !== "boolean") {
				Console.printError(`Client disconnected with error: ${err.message}`);
			}
		}
		socket.on("close", playerDisconnect.bind(this));
		socket.on("error", playerDisconnect.bind(this));

		socket.on("data", chunk => {
			const reader = new Reader(chunk);

			// Let mpClient take over if it exists
			if (mpClient instanceof MPClient) {
				mpClient.handlePacket(reader);
				return;
			}

			const packetId = reader.readUByte();
			switch (packetId) {
				// TODO: Handle timeouts at some point, idk.
				case Packets.KeepAlive: break;
				case Packets.LoginRequest: this.handleLoginRequest(reader, socket, setMPClient.bind(this)); break;
				case Packets.Handshake: this.handleHandshake(reader, socket); break;
			}
		});
	}
}