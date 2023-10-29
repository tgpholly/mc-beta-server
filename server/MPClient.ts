import { Console } from "hsconsole";
import { IReader } from "bufferstuff";
import { MinecraftServer } from "./MinecraftServer";
import { Packet } from "./enums/Packet";
import { PacketAnimation } from "./packets/Animation";
import { PacketChat } from "./packets/Chat"
import { PacketEntityAction } from "./packets/EntityAction";
import { PacketPlayer } from "./packets/Player";
import { PacketPlayerPosition } from "./packets/PlayerPosition";
import { PacketPlayerLook } from "./packets/PlayerLook";
import { PacketPlayerPositionLook } from "./packets/PlayerPositionLook";
import { PacketPlayerDigging } from "./packets/PlayerDigging";
import { Player } from "./entities/Player";
import { Socket } from "net";
import { Vec3 } from "./Vec3";
import { PacketRespawn } from "./packets/Respawn";
import { PacketSpawnPosition } from "./packets/SpawnPosition";
import { PacketPlayerBlockPlacement } from "./packets/PlayerBlockPlacement";
import { Inventory } from "./inventories/Inventory";
import { PacketHoldingChange } from "./packets/HoldingChange";
import { PacketDisconnectKick } from "./packets/DisconnectKick";

export class MPClient {
	private readonly mcServer:MinecraftServer;
	private readonly socket:Socket;
	public entity:Player;
	private inventory:Inventory;

	private holdingIndex:number = 36; // First hotbar slot.
	private diggingAt:Vec3;

	public constructor(mcServer:MinecraftServer, socket:Socket, entity:Player) {
		this.mcServer = mcServer;
		this.socket = socket;
		this.entity = entity;
		this.inventory = entity.inventory;

		this.diggingAt = new Vec3();
	}

	private mapCoordsFromFace(pos:Vec3, face:number) {
		switch (face) {
			case 0:
				pos.y--;
				return pos;
			case 1:
				pos.y++;
				return pos;
			case 2:
				pos.z--;
				return pos;
			case 3:
				pos.z++;
				return pos;
			case 4:
				pos.x--;
				return pos;
			case 5:
				pos.x++;
				return pos;
		}
	}

	public handlePacket(reader:IReader) {
		const packetId = reader.readUByte();

		switch (packetId) {
			case Packet.Chat:                 this.handleChat(new PacketChat().readData(reader)); break;
			case Packet.Player:               this.handlePacketPlayer(new PacketPlayer().readData(reader)); break;
			case Packet.PlayerPosition:       this.handlePacketPlayerPosition(new PacketPlayerPosition().readData(reader)); break;
			case Packet.PlayerLook:           this.handlePacketPlayerLook(new PacketPlayerLook().readData(reader)); break;
			case Packet.PlayerPositionLook:   this.handlePacketPlayerPositionLook(new PacketPlayerPositionLook().readData(reader)); break;
			case Packet.PlayerDigging:        this.handlePacketPlayerDigging(new PacketPlayerDigging().readData(reader)); break;
			case Packet.PlayerBlockPlacement: this.handlePacketBlockPlacement(new PacketPlayerBlockPlacement().readData(reader)); break;
			case Packet.HoldingChange:        this.handlePacketHoldingChange(new PacketHoldingChange().readData(reader)); break;
			//case Packets.UseBed: break;
			case Packet.Animation:            this.handlePacketAnimation(new PacketAnimation().readData(reader)); break;
			case Packet.EntityAction:         this.handlePacketEntityAction(new PacketEntityAction().readData(reader)); break;
			case Packet.DisconnectKick:       this.handleDisconnectKick(); break;
			default: Console.printWarn(`UNIMPLEMENTED PACKET: ${Packet[packetId]}`); break;
		}
	}
	
	private handleChat(packet:PacketChat) {
		const message = packet.message.split(" ");
		if (message[0].startsWith("/")) {
			packet.message = "";
			if (message[0] === "/tp") {
				const x = this.entity.x = parseFloat(message[1]);
				const y = this.entity.y = parseFloat(message[2]);
				const z = this.entity.z = parseFloat(message[3]);
				this.send(new PacketPlayerPositionLook(x, y, y + 0.62, z, 0, 0, false).writeData());
				Console.printInfo(packet.message = `Teleported ${this.entity.username} to ${message[1]} ${message[2]} ${message[3]}`);
			} else if (message[0] === "/csay") {
				this.mcServer.sendChatMessage(`[CONSOLE] ${message.slice(1, message.length).join(" ")}`);
			} else if (message[0] === "/top") {
				packet.message = `Woosh!`;
				const topBlock = this.entity.world.getChunk(this.entity.x >> 4, this.entity.z >> 4).getTopBlockY(this.entity.x & 0xf, this.entity.z & 0xf);
				this.send(new PacketPlayerPosition(this.entity.x, topBlock + 3, topBlock + 3.62, this.entity.z, false).writeData());
			} else if (message[0] === "/tpx") {
				const dimension = parseInt(message[1]);
				if (this.mcServer.worlds.has(dimension)) {
					packet.message = "\u00a76Switching dimensions...";	
					this.switchDimension(dimension);
				} else {
					packet.message = `\u00a7cNo dimension by id "${dimension} exists!"`;
				}
			}

			if (packet.message !== "") {
				this.send(packet.writeData());
			}

			return;
		}

		packet.message = `<${this.entity.username}> ${packet.message}`;
		Console.printInfo(`[CHAT] ${packet.message}`);
		this.mcServer.sendToAllClients(packet.writeData());
	}

	private handlePacketPlayer(packet:PacketPlayer) {
		this.entity.onGround = packet.onGround;
	}

	private handlePacketPlayerPosition(packet:PacketPlayerPosition) {
		this.entity.x = packet.x;
		this.entity.y = packet.y;
		this.entity.z = packet.z;
	}

	private handlePacketPlayerLook(packet:PacketPlayerLook) {
		this.entity.yaw = packet.yaw;
		this.entity.pitch = packet.pitch;
	}

	private handlePacketPlayerPositionLook(packet:PacketPlayerPositionLook) {
		this.entity.x = packet.x;
		this.entity.y = packet.y;
		this.entity.z = packet.z;
		this.entity.yaw = packet.yaw;
		this.entity.pitch = packet.pitch;
	}

	private handlePacketPlayerDigging(packet:PacketPlayerDigging) {
		// Special drop item case
		if (packet.status === 4) {
			// TODO: Handle dropping items
			return;
		}

		this.diggingAt.set(packet.x, packet.y, packet.z);
		//this.mapCoordsToFace(this.diggingAt, packet.face);

		if (packet.status === 0) {
			// Started digging
		} else if (packet.status === 2) {
			if (this.entity.world.getBlockId(this.diggingAt.x, this.diggingAt.y, this.diggingAt.z) != 0) {
				this.entity.world.setBlockWithNotify(this.diggingAt.x, this.diggingAt.y, this.diggingAt.z, 0);
			}
		}
	}

	private handlePacketBlockPlacement(packet:PacketPlayerBlockPlacement) {
		this.diggingAt.set(packet.x, packet.y, packet.z);
		this.mapCoordsFromFace(this.diggingAt, packet.face);

		const itemStack = this.inventory.getSlotItemStack(this.holdingIndex);
		if (itemStack != null && itemStack.size > 0 && this.entity.world.getBlockId(this.diggingAt.x, this.diggingAt.y, this.diggingAt.z) === 0) {
			itemStack.size--;
			this.entity.world.setBlockAndMetadataWithNotify(this.diggingAt.x, this.diggingAt.y, this.diggingAt.z, itemStack.itemID, itemStack.damage);
		}
	}

	private handlePacketHoldingChange(packet:PacketHoldingChange) {
		if (packet.slotId < 0 || packet.slotId > 8) {
			this.send(new PacketDisconnectKick("Out of Bounds Holding Index!").writeData());
			this.socket.end();
			return;
		}

		this.holdingIndex = 36 + packet.slotId;
	}

	// Animation start
	private handlePacketAnimation(packet:PacketAnimation) {
		// Forward this packet to all nearby clients
		this.entity.world.sendToNearbyClients(this.entity, packet.writeData());
	}

	private handlePacketEntityAction(packet:PacketEntityAction) {
		// Forward this packet to all nearby clients
		switch (packet.action) {
			case 1: this.entity.crouching = true; break;
			case 2: this.entity.crouching = false; break;
			case 3: break; // TODO: Leave Bed
		}
	}

	private switchDimension(dimension:number) {
		const world = this.mcServer.worlds.get(dimension);
		if (world == undefined) {
			return;
		}

		this.entity.world.removeEntity(this.entity);
		this.entity.world = world;
		world.addEntity(this.entity);

		this.send(new PacketRespawn(dimension).writeData());
		//this.send(new PacketSpawnPosition(8, 64, 8).writeData());
		this.entity.x = 8;
		this.entity.y = 70;
		this.entity.z = 8;
		this.send(new PacketPlayerPositionLook(8, 70, 70.62, 8, 0, 0, false).writeData());

		this.entity.forceUpdatePlayerChunks();
	}

	private handleDisconnectKick() {
		this.socket.end();
	}

	public send(buffer:Buffer) {
		this.socket.write(buffer);
	}
}