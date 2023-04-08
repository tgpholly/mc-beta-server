import { Config } from "../config";
import { Console } from "../console";
import { Server, Socket } from "net";
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
import { PacketTimeUpdate } from "./packets/TimeUpdate";
import { PacketSpawnPosition } from "./packets/SpawnPosition";
import { Chunk } from "./Chunk";
import { PacketMapChunk } from "./packets/MapChunk";
import { PacketPlayerPositionLook } from "./packets/PlayerPositionLook";
import { PacketPreChunk } from "./packets/PreChunk";

export class MinecraftServer {
	private static readonly PROTOCOL_VERSION = 14;
	private static readonly TICK_RATE = 20;
	private static readonly TICK_RATE_MS = 1000 / MinecraftServer.TICK_RATE;
	private readonly keepalivePacket = new PacketKeepAlive().writeData();

	private totalClients:number = 0;
	private config:Config;
	private server:Server;
	private serverClock:NodeJS.Timer;
	private tickCounter:number = 0;
	private clients:FunkyArray<number, MPClient>;
	private worlds:FunkyArray<number, World>;

	public constructor(config:Config) {
		this.config = config;

		this.clients = new FunkyArray<number, MPClient>();

		this.worlds = new FunkyArray<number, World>();
		this.worlds.set(0, new World());

		this.serverClock = setInterval(() => {
			// Every 1 sec
			if (this.tickCounter % MinecraftServer.TICK_RATE === 0)  {
				if (this.clients.length !== 0) {
					const timePacket = new PacketTimeUpdate(this.tickCounter).writeData();
					this.clients.forEach(client => {
						client.send(this.keepalivePacket);
						client.send(timePacket);
					});
				}
			}

			this.worlds.forEach(world => {
				world.tick(this.tickCounter);
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

	onConnection(socket:Socket) {
		socket.on("data", chunk => {
			const reader = new Reader(chunk);

			const packetId = reader.readUByte();
			//console.log(packetId);
			switch (packetId) {
				// Handle timeouts at some point, idk.
				case Packets.KeepAlive:
					break;

				case Packets.LoginRequest:
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
						socket.write(new PacketLoginRequest(clientEntity.entityId, "", 0, -1).writeData());
						socket.write(new PacketSpawnPosition(8, 64, 8).writeData());

						socket.write(new PacketPreChunk(0, 0, true).writeData());
						const chunk = world.getChunk(0, 0);
						if (chunk instanceof Chunk) {
							(async () => {
								const chunkData = await (new PacketMapChunk(0, 0, 0, 15, 127, 15, chunk).writeData());
								socket.write(chunkData);
								socket.write(new PacketPlayerPositionLook(8, 66, 66.62, 8, 0, 0, false).writeData());
							})();
						}
						const client = new MPClient(socket, clientEntity);
						this.clients.set(this.totalClients++, client);
					} else {
						socket.write(new PacketDisconnectKick("Failed to find world to put player in.").writeData());
					}
					break;

				case Packets.Handshake:
					const handshakePacket = new PacketHandshake().readData(reader);
					socket.write(handshakePacket.writeData());
					break;
			}
		});
	}
}