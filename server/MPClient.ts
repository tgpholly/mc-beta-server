import { IReader } from "bufferstuff";
import { Console } from "hsconsole";
import { Socket } from "net";
import AABB from "./AABB";
import Block from "./blocks/Block";
import EntityLiving from "./entities/EntityLiving";
import EntityItem from "./entities/EntityItem";
import ItemStack from "./inventories/ItemStack";
import MinecraftServer from "./MinecraftServer";
import Packet from "./enums/Packet";
import PacketAnimation from "./packets/Animation";
import PacketChat from "./packets/Chat"
import PacketEntityAction from "./packets/EntityAction";
import PacketPlayer from "./packets/Player";
import PacketPlayerPosition from "./packets/PlayerPosition";
import PacketPlayerLook from "./packets/PlayerLook";
import PacketPlayerPositionLook from "./packets/PlayerPositionLook";
import PacketPlayerDigging from "./packets/PlayerDigging";
import PacketRespawn from "./packets/Respawn";
import PacketPlayerBlockPlacement from "./packets/PlayerBlockPlacement";
import PacketHoldingChange from "./packets/HoldingChange";
import PacketDisconnectKick from "./packets/DisconnectKick";
import PacketSoundEffect from "./packets/SoundEffect";
import PacketUseEntity from "./packets/UseEntity";
import Player from "./entities/Player";
import PlayerInventory from "./inventories/PlayerInventory";
import SoundEffects from "./enums/SoundEffects";
import Vec3 from "./Vec3";
import TextColorParser from "./TextColorParser";
import FunkyArray from "funky-array";
import Window from "./windows/Window";
import WindowChest from "./windows/WindowChest";
import TileEntityChest from "./tileentities/TileEntityChest";
import WindowCrafting from "./windows/WindowCrafting";
import PacketWindowClick from "./packets/WindowClick";
import PlayerCombinedInventory from "./inventories/PlayerCombinedInventory";
import PacketCloseWindow from "./packets/CloseWindow";

export default class MPClient {
	private readonly mcServer: MinecraftServer;
	private readonly socket: Socket;
	public entity: Player;
	private inventory: PlayerInventory;

	private holdingIndex: number = 36; // First hotbar slot.
	private diggingAt: Vec3;

	private windows: FunkyArray<number, Window>;

	public constructor(mcServer: MinecraftServer, socket: Socket, entity: Player) {
		this.mcServer = mcServer;
		this.socket = socket;
		this.entity = entity;
		this.inventory = entity.inventory;

		this.diggingAt = new Vec3();
		this.windows = new FunkyArray<number, Window>();
	}

	private mapCoordsFromFace(pos: Vec3, face: number) {
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

	public handlePacket(reader: IReader) {
		const packetId = reader.readUByte();

		switch (packetId) {
			case Packet.Chat:                 this.handleChat(new PacketChat().readData(reader)); break;
			case Packet.UseEntity:			  this.handleUseEntity(new PacketUseEntity().readData(reader)); break;
			case Packet.Respawn:			  this.handlePacketRespawn(new PacketRespawn().readData(reader)); break;
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
			case Packet.CloseWindow:		  this.handleWindowClose(new PacketCloseWindow().readData(reader)); break;
			case Packet.WindowClick:		  this.handleWindowClick(new PacketWindowClick().readData(reader)); break;
			case Packet.DisconnectKick:       this.handleDisconnectKick(); break;
			default: return Console.printWarn(`UNIMPLEMENTED PACKET: ${Packet[packetId]} 0x${packetId < 10 ? `0${packetId.toString(16).toUpperCase()}` : packetId.toString(16).toUpperCase()}`);
		}

		if (reader.readOffset < reader.length - 1) {
			this.handlePacket(reader);
		}
	}
	
	private handleUseEntity(packet: PacketUseEntity) {
		const attacker = this.entity.world.entites.get(packet.userId);
		const target = this.entity.world.entites.get(packet.targetId);
		if (attacker && target && target instanceof EntityLiving) {
			if (packet.leftClick) {
				target.damageFrom(2, attacker);
			}
		}
	}

	private handleChat(packet: PacketChat) {
		const message = packet.message.split(" ");
		if (message[0].startsWith("/")) {
			packet.message = "";
			if (message[0] === "/tp") {
				const x = this.entity.position.x = parseFloat(message[1]);
				const y = this.entity.position.y = parseFloat(message[2]);
				const z = this.entity.position.z = parseFloat(message[3]);
				this.send(new PacketPlayerPositionLook(x, y, y + 0.62, z, 0, 0, false).writeData());
				Console.printInfo(packet.message = `Teleported ${this.entity.username} to ${message[1]} ${message[2]} ${message[3]}`);
			} else if (message[0] === "/csay") {
				this.mcServer.sendChatMessage(`[CONSOLE] ${message.slice(1, message.length).join(" ")}`);
			} else if (message[0] === "/top") {
				packet.message = `Woosh!`;
				const topBlock = this.entity.chunk.getTopBlockY(this.entity.position.x & 0xf, this.entity.position.z & 0xf);
				this.send(new PacketPlayerPosition(this.entity.position.x, topBlock + 3, topBlock + 3.62, this.entity.position.z, false).writeData());
			} else if (message[0] === "/tpx") {
				const dimension = parseInt(message[1]);
				if (this.mcServer.worlds.has(dimension)) {
					packet.message = "\u00a76Switching dimensions...";	
					this.switchDimension(dimension);
				} else {
					packet.message = `\u00a7cNo dimension by id "${dimension}" exists!`;
				}
			}

			if (packet.message !== "") {
				this.send(packet.writeData());
			}

			return;
		}

		packet.message = `<${this.entity.username}> ${packet.message}`;
		Console.printInfo(`[CHAT] ${TextColorParser.ParseConsole(packet.message)}`);
		this.mcServer.sendToAllClients(packet.writeData());
	}

	private handlePacketRespawn(packet: PacketRespawn) {
		if (!this.entity.isDead && packet.dimension === this.entity.world.dimension) {
			return;
		}

		const world = this.mcServer.worlds.get(this.entity.world.dimension);
		if (world == undefined) {
			return;
		}

		this.entity.world.removeEntity(this.entity);
		const oldPlayerEntity = this.entity;

		this.entity = new Player(world, oldPlayerEntity.username);
		this.entity.position.set(8, 70, 8);
		world.addEntity(this.entity);

		this.send(new PacketRespawn(world.dimension).writeData());
		//this.send(new PacketSpawnPosition(8, 64, 8).writeData());
		this.entity.position.set(this.entity.position.x, this.entity.position.y, this.entity.position.z);
		this.send(new PacketPlayerPositionLook(this.entity.position.x, this.entity.position.y, this.entity.position.y + 0.62, this.entity.position.z, 0, 0, false).writeData());

		this.entity.forceUpdatePlayerChunks();
	}

	private handlePacketPlayer(packet: PacketPlayer) {
		this.entity.onGround = packet.onGround;
	}

	private handlePacketPlayerPosition(packet: PacketPlayerPosition) {
		this.entity.onGround = packet.onGround;
		this.entity.position.set(packet.x, packet.y, packet.z);
	}

	private handlePacketPlayerLook(packet: PacketPlayerLook) {
		this.entity.onGround = packet.onGround;
		this.entity.rotation.set(packet.yaw, packet.pitch);
	}

	private handlePacketPlayerPositionLook(packet: PacketPlayerPositionLook) {
		this.entity.onGround = packet.onGround;
		this.entity.position.set(packet.x, packet.y, packet.z);
		this.entity.rotation.set(packet.yaw, packet.pitch);
	}

	private breakBlock(brokenBlockId: number, x: number, y: number, z: number) {
		const metadata = this.entity.world.getBlockMetadata(this.diggingAt.x, this.diggingAt.y, this.diggingAt.z);
		this.entity.world.setBlockWithNotify(this.diggingAt.x, this.diggingAt.y, this.diggingAt.z, 0);
		//this.inventory.addItemStack(new ItemStack(Block.blockBehaviours[brokenBlockId].droppedItem(brokenBlockId), 1, metadata));
		//this.send(new PacketWindowItems(0, this.inventory.getInventorySize(), this.inventory.constructInventoryPayload()).writeData());
		const blockBehaviour = Block.blockBehaviours[brokenBlockId];
		blockBehaviour?.destroyed(this.entity.world, x, y, z);
		const itemId = blockBehaviour.droppedItem(brokenBlockId);
		if (itemId !== -1) {
			const itemCount = blockBehaviour.droppedCount(brokenBlockId);
			this.entity.sendToNearby(new PacketSoundEffect(SoundEffects.BLOCK_BREAK, x, y, z, brokenBlockId).writeData());
			for (let i = 0; i < ((itemCount - 1) >> 6) + 1; i++) {
				const itemEntity = new EntityItem(this.entity.world, new ItemStack(itemId, Math.min(itemCount - 64 * i, 64), metadata));
				itemEntity.position.set(x + 0.5, y + 0.5, z + 0.5);
				itemEntity.pickupDelay = 10;
				this.entity.world.addEntity(itemEntity);
			}
		}
	}

	private throwItemStack(itemStack: ItemStack) {
		const itemEntity = new EntityItem(this.entity.world, new ItemStack(itemStack.itemID, 1, itemStack.damage));
		itemEntity.pickupDelay = 10;
		itemEntity.position.set(this.entity.position.x, this.entity.position.y + 1.50, this.entity.position.z);
		itemEntity.motion.set(
			-Math.sin((this.entity.rotation.yaw / 180) * Math.PI) * Math.cos((this.entity.rotation.pitch / 180) * Math.PI) * 0.3,
			-Math.sin((this.entity.rotation.pitch / 180) * Math.PI) * 0.3 + 0.1,
			Math.cos((this.entity.rotation.yaw / 180) * Math.PI) * Math.cos((this.entity.rotation.pitch / 180) * Math.PI) * 0.3
		);
		// Add random motion vector
		const twoPIRandomised = Math.random() * Math.PI * 2;
		const rngMult = 0.02 * Math.random();
		itemEntity.motion.add(
			Math.cos(twoPIRandomised) * rngMult,
			(Math.random() - Math.random()) * 0.1,
			Math.sin(twoPIRandomised) * rngMult
		);
		this.entity.world.addEntity(itemEntity);
	}

	// TODO: Cap how far away a player is able to break blocks
	private handlePacketPlayerDigging(packet: PacketPlayerDigging) {

		// Special drop item case
		if (packet.status === 4) {
			const itemStack = this.getHeldItemStack();
			if (itemStack !== null && itemStack.size > 0) {
				this.throwItemStack(itemStack.split(1));

				this.inventory.dropEmptyItemStacks();
				this.inventory.sendUpdatedStacks([this.holdingIndex]);
			}
			return;
		}

		this.diggingAt.set(packet.x, packet.y, packet.z);

		let brokenBlockId:number;
		if (packet.status === 0) {
			// Started digging
			if ((brokenBlockId = this.entity.world.getBlockId(this.diggingAt.x, this.diggingAt.y, this.diggingAt.z)) != 0 && Block.blocks[brokenBlockId].blockStrength() >= 1) {
				this.breakBlock(brokenBlockId, this.diggingAt.x, this.diggingAt.y, this.diggingAt.z);
			}
		} else if (packet.status === 2) {
			if ((brokenBlockId = this.entity.world.getBlockId(this.diggingAt.x, this.diggingAt.y, this.diggingAt.z)) != 0) {
				this.breakBlock(brokenBlockId, this.diggingAt.x, this.diggingAt.y, this.diggingAt.z);
			}
		}
	}

	public getHeldItemStack() {
		return this.inventory.getSlotItemStack(this.holdingIndex);
	}

	private handlePacketBlockPlacement(packet: PacketPlayerBlockPlacement) {
		this.diggingAt.set(packet.x, packet.y, packet.z);
		this.mapCoordsFromFace(this.diggingAt, packet.face);

		const blockClicked = Block.blocks[this.entity.world.getBlockId(packet.x, packet.y, packet.z)];
		if (!this.entity.crouching && blockClicked && blockClicked.behaviour.interactable()) {
			if (blockClicked.is(Block.chest)) {
				const tileEntity = this.entity.world.getChunk(packet.x >> 4, packet.z >> 4).getTileEntity(packet.x, packet.y, packet.z);
				if (tileEntity && tileEntity instanceof TileEntityChest) {
					const window = new WindowChest(this, PlayerCombinedInventory.FromExisting(this, tileEntity.inventory, tileEntity.inventory.name));
					this.windows.set(window.windowId, window);
					window.openWindow();
				}
			} else if (blockClicked.is(Block.craftingTable)) {
				const window = new WindowCrafting(this, new PlayerCombinedInventory(this, 10, "Crafting"));
				this.windows.set(window.windowId, window);
				window.openWindow();
			}

			return;
		}

		if (this.entity.entityAABB.intersects(AABB.getAABB(this.diggingAt.x, this.diggingAt.y, this.diggingAt.z, this.diggingAt.x + 1, this.diggingAt.y + 1, this.diggingAt.z + 1))) {
			return;
		}

		const itemStack = this.getHeldItemStack();
		if (itemStack == null || itemStack.size == 0) {
			return;
		}

		if (itemStack.isBlock && Block.blocks[itemStack.itemID].behaviour.canPlaceBlockAt(this.entity.world, this.diggingAt.x, this.diggingAt.y, this.diggingAt.z)) {
			if (this.entity.world.getBlockId(this.diggingAt.x, this.diggingAt.y, this.diggingAt.z) === 0) {
				itemStack.size--;
				this.entity.world.setBlockAndMetadataWithNotify(this.diggingAt.x, this.diggingAt.y, this.diggingAt.z, itemStack.itemID, itemStack.damage);
				Block.blockBehaviours[itemStack.itemID]?.placed(this.entity.world, this.diggingAt.x, this.diggingAt.y, this.diggingAt.z);
				this.inventory.dropEmptyItemStacks();
			}
		} else {
			// TODO: Handle item usage
		}
	}

	private handlePacketHoldingChange(packet: PacketHoldingChange) {
		if (packet.slotId < 0 || packet.slotId > 8) {
			this.send(new PacketDisconnectKick("Out of Bounds Holding Index!").writeData());
			this.socket.end();
			return;
		}

		this.holdingIndex = 36 + packet.slotId;
	}

	// Animation start
	private handlePacketAnimation(packet: PacketAnimation) {
		// Forward this packet to all nearby clients
		this.entity.world.sendToNearbyClients(this.entity, packet.writeData());
	}

	private handlePacketEntityAction(packet: PacketEntityAction) {
		// Forward this packet to all nearby clients
		switch (packet.action) {
			case 1: this.entity.crouching = true; break;
			case 2: this.entity.crouching = false; break;
			case 3: break; // TODO: Leave Bed
		}
	}

	private switchDimension(dimension: number) {
		const world = this.mcServer.worlds.get(dimension);
		if (world == undefined) {
			return;
		}

		this.entity.world.removeEntity(this.entity);
		this.entity.world = world;
		world.addEntity(this.entity);

		this.send(new PacketRespawn(dimension).writeData());
		//this.send(new PacketSpawnPosition(8, 64, 8).writeData());
		this.entity.position.set(8, 60, 8);
		this.send(new PacketPlayerPositionLook(8, 70, 70.62, 8, 0, 0, false).writeData());

		this.entity.forceUpdatePlayerChunks();
	}

	private handleWindowClick(windowClick: PacketWindowClick) {
		const window = this.windows.get(windowClick.windowId);
		if (!window) {
			return this.send(new PacketDisconnectKick("Attempted to perform action on window that does not exist.").writeData());
		}

		window.clickedWindow(windowClick.slot, windowClick.rightClick);
	}

	private handleWindowClose(closeWindow: PacketCloseWindow) {
		if (closeWindow.windowId === 0) {
			return;
		}

		const window = this.windows.get(closeWindow.windowId);
		if (window) {
			window.closeWindow();
			if (window.cursorItemStack && window.cursorItemStack.size > 0) {
				this.throwItemStack(window.cursorItemStack);
				window.cursorItemStack = null;
			}
			this.windows.remove(window.windowId);
		}
	}

	private handleDisconnectKick() {
		this.socket.end();
	}

	public send(buffer: Buffer) {
		this.socket.write(buffer);
	}
}