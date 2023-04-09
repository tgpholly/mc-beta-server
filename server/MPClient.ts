import { Socket } from "net";
import { Reader, Writer } from "../bufferStuff";
import { Packets } from "./enums/Packets";
import { PacketPlayer } from "./packets/Player";
import { PacketPlayerPosition } from "./packets/PlayerPosition";
import { PacketPlayerLook } from "./packets/PlayerLook";
import { PacketPlayerPositionLook } from "./packets/PlayerPositionLook";
import { Player } from "./entities/Player";
import { PacketChat } from "./packets/Chat";

export class MPClient {
	private readonly socket:Socket;
	public readonly entity:Player;

	public constructor(socket:Socket, entity:Player) {
		this.socket = socket;
		this.entity = entity;
	}

	handlePacket(reader:Reader) {
		const packetId = reader.readUByte();

		switch (packetId) {
			case Packets.Chat:               this.handleChat(new PacketChat().readData(reader)); break;
			case Packets.Player:             this.handlePacketPlayer(new PacketPlayer().readData(reader)); break;
			case Packets.PlayerPosition:     this.handlePacketPlayerPosition(new PacketPlayerPosition().readData(reader)); break;
			case Packets.PlayerLook:         this.handlePacketPlayerLook(new PacketPlayerLook().readData(reader)); break;
			case Packets.PlayerPositionLook: this.handlePacketPlayerPositionLook(new PacketPlayerPositionLook().readData(reader)); break;
		}
	}
	
	handleChat(packet:PacketChat) {
		const message = packet.message.split(" ");
		if (message[0] === "/tp") {
			this.send(new PacketPlayerPositionLook(parseFloat(message[1]), parseFloat(message[2]), parseFloat(message[2]) + 0.62, parseFloat(message[3]), 0, 0, false).writeData());
		}
	}

	handlePacketPlayer(packet:PacketPlayer) {
		this.entity.onGround = packet.onGround;
	}

	handlePacketPlayerPosition(packet:PacketPlayerPosition) {
		this.entity.x = packet.x;
		this.entity.y = packet.y;
		this.entity.z = packet.z;
	}

	handlePacketPlayerLook(packet:PacketPlayerLook) {
		this.entity.yaw = packet.yaw;
		this.entity.pitch = packet.pitch;
	}

	handlePacketPlayerPositionLook(packet:PacketPlayerPositionLook) {
		this.entity.x = packet.x;
		this.entity.y = packet.y;
		this.entity.z = packet.z;
		this.entity.yaw = packet.yaw;
		this.entity.pitch = packet.pitch;
	}

	send(buffer:Buffer|Writer) {
		if (buffer instanceof Writer) {
			this.socket.write(buffer.toBuffer());
		} else {
			this.socket.write(buffer);
		}
	}
}