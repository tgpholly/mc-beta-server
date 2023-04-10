import { Socket } from "net";
import { Reader, Writer } from "../bufferStuff";
import { Packets } from "./enums/Packets";
import { PacketPlayer } from "./packets/Player";
import { PacketPlayerPosition } from "./packets/PlayerPosition";
import { PacketPlayerLook } from "./packets/PlayerLook";
import { PacketPlayerPositionLook } from "./packets/PlayerPositionLook";
import { Player } from "./entities/Player";
import { PacketChat } from "./packets/Chat";
import { MinecraftServer } from "./MinecraftServer";
import { Vec3 } from "./Vec3";
import { Console } from "../console";

export class MPClient {
	private readonly mcServer:MinecraftServer;
	private readonly socket:Socket;
	public readonly entity:Player;

	public constructor(mcServer:MinecraftServer, socket:Socket, entity:Player) {
		this.mcServer = mcServer;
		this.socket = socket;
		this.entity = entity;
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

	public handlePacket(reader:Reader) {
		const packetId = reader.readUByte();

		switch (packetId) {
			case Packets.Chat:               this.handleChat(new PacketChat().readData(reader)); break;
			case Packets.Player:             this.handlePacketPlayer(new PacketPlayer().readData(reader)); break;
			case Packets.PlayerPosition:     this.handlePacketPlayerPosition(new PacketPlayerPosition().readData(reader)); break;
			case Packets.PlayerLook:         this.handlePacketPlayerLook(new PacketPlayerLook().readData(reader)); break;
			case Packets.PlayerPositionLook: this.handlePacketPlayerPositionLook(new PacketPlayerPositionLook().readData(reader)); break;
			case Packets.PlayerDigging:      this.handlePacketPlayerDigging(); break;
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

	private handlePacketPlayerDigging() {

	}

	public send(buffer:Buffer|Writer) {
		if (buffer instanceof Writer) {
			this.socket.write(buffer.toBuffer());
		} else {
			this.socket.write(buffer);
		}
	}
}