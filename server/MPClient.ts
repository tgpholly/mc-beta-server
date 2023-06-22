import { Console } from "../console";
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

export class MPClient {
	private readonly mcServer:MinecraftServer;
	private readonly socket:Socket;
	public readonly entity:Player;

	private diggingAt:Vec3;

	public constructor(mcServer:MinecraftServer, socket:Socket, entity:Player) {
		this.mcServer = mcServer;
		this.socket = socket;
		this.entity = entity;

		this.diggingAt = new Vec3();
	}

	private mapCoordsToFace(pos:Vec3, face:number) {
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
			//case Packets.PlayerBlockPlacement: break;
			//case Packets.HoldingChange: break;
			//case Packets.UseBed: break;
			case Packet.Animation:            this.handlePacketAnimation(new PacketAnimation().readData(reader)); break;
			case Packet.EntityAction:         this.handlePacketEntityAction(new PacketEntityAction().readData(reader)); break;
			default: Console.printWarn(`UNIMPLEMENTED PACKET: ${Packet[packetId]}`); break;
		}
	}
	
	private handleChat(packet:PacketChat) {
		const message = packet.message.split(" ");
		if (message[0].startsWith("/")) {
			packet.message = "";
			if (message[0] === "/tp") {
				this.send(new PacketPlayerPositionLook(parseFloat(message[1]), parseFloat(message[2]), parseFloat(message[2]) + 0.62, parseFloat(message[3]), 0, 0, false).writeData());
				Console.printInfo(packet.message = `Teleported ${this.entity.username} to ${message[1]} ${message[2]} ${message[3]}`);
			} else if (message[0] === "/csay") {
				const consoleMessage = `[CONSOLE] ${message.slice(1, message.length).join(" ")}`;
				Console.printChat(consoleMessage);
				this.mcServer.sendToAllClients(new PacketChat(consoleMessage).writeData());
			} else if (message[0] === "/top") {
				// TODO: Figure out why this is broken
				packet.message = `Woosh!`;
				const topBlock = this.entity.world.getChunk(this.entity.x >> 4, this.entity.z >> 4).getTopBlockY(this.entity.x & 0xf, this.entity.z & 0xf);
				console.log(topBlock);
				this.send(new PacketPlayerPosition(this.entity.x, topBlock + 4, topBlock + 4.62, this.entity.z, false).writeData());
			}

			if (packet.message !== "") {
				this.send(packet.writeData());
			}

			return;
		}

		packet.message = `<${this.entity.username}> ${packet.message}`;
		Console.printChat(packet.message);
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
				this.entity.world.setBlockWithMetadata(0, 0, this.diggingAt.x, this.diggingAt.y, this.diggingAt.z, true);
			}
		}
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

	public send(buffer:Buffer) {
		this.socket.write(buffer);
	}
}