const bufferStuff = require("./bufferStuff.js");
const ChunkManager = require("./chunkManager.js");
const User = require("./user.js");
const PacketMappingTable = require("./PacketMappingTable.js");
const NamedPackets = require("./NamedPackets.js");

const Socket = require("net").Socket;
const uuid = require("uuid").v4;

let idPool = 1;
global.fromIDPool = function() {
	const oldVal = idPool;
	idPool++;
	return oldVal;
}

let netUsers = {},
	netUserKeys = Object.keys(netUsers);

global.getUserByKey = function(key) {
	return netUsers[key];
}

function addUser(socket) {
	let user = new User(global.fromIDPool(), socket);
	netUsers[user.id] = user;
	netUserKeys = Object.keys(netUsers);

	return user;
}

function removeUser(id) {
	delete netUsers[id];
	netUserKeys = Object.keys(netUsers);
}

let config = {};

let entities = {};
let entityKeys = {};

global.chunkManager = new ChunkManager();
global.generatingChunks = false;

let tickInterval, tickCounter = BigInt(0);
let tickRate = BigInt(20);

module.exports.init = function(config) {
	config = config;
    console.log(`Up! Running at 0.0.0.0:${config.port}`);

	tickInterval = setInterval(() => {
		// Runs every sec
		if (tickCounter % tickRate == 0) {
			for (let key of netUserKeys) {
				const user = netUsers[key];
				user.socket.write(new PacketMappingTable[NamedPackets.KeepAlive]().writePacket());
				if (user.loginFinished) user.socket.write(new PacketMappingTable[NamedPackets.TimeUpdate](tickCounter).writePacket());
			}
		}
		// Do chunk updates
		if (!global.generatingChunks) {
			let itemsToRemove = [];
			// Do a max of 128 chunk updates per tick
			for (let i = 0; i < Math.min(global.chunkManager.queuedBlockUpdates.getLength(), 128); i++) {
				const chunkUpdateKey = global.chunkManager.queuedBlockUpdates.itemKeys[i];
				const chunkUpdate = global.chunkManager.queuedBlockUpdates.items[chunkUpdateKey];
				if (global.chunkManager.chunks[chunkUpdate[1]] == null) continue;
				if (global.chunkManager.chunks[chunkUpdate[1]][chunkUpdate[2]] == null) continue;
				itemsToRemove.push(chunkUpdateKey);
				
				try {
					global.chunkManager.chunks[chunkUpdate[1]][chunkUpdate[2]][chunkUpdate[3]][chunkUpdate[4]][chunkUpdate[5]] = chunkUpdate[0];

					const packet = new PacketMappingTable[NamedPackets.BlockChange](chunkUpdate[4] + (16 * chunkUpdate[1]), chunkUpdate[3], chunkUpdate[5] + (16 * chunkUpdate[2]), chunkUpdate[0]).writePacket();
					for (let userKey in netUserKeys) {
						const user = netUsers[userKey];
						if (user.loginFinished) user.socket.write(packet);
					}
				} catch (e) {}
			}

			for (let item of itemsToRemove) {
				global.chunkManager.queuedBlockUpdates.remove(item, false);
			}
		}

		// Entity update!
		for (let key of netUserKeys) {
			const user = netUsers[key];


		}

		// Send queued chunks to users
		for (let key of netUserKeys) {
			const user = netUsers[key];

			if (user.loginFinished) {
				let itemsToRemove = [];
				for (let i = 0; i < Math.min(user.chunksToSend.getLength(), 128); i++) {
					const chunkKey = user.chunksToSend.itemKeys[i];
					itemsToRemove.push(chunkKey);
					user.socket.write(user.chunksToSend.items[chunkKey]);
				}

				for (let item of itemsToRemove) {
					user.chunksToSend.remove(item, false);
				}

				user.chunksToSend.regenerateIterableArray();
			}
		}

		tickCounter++;
	}, 1000 / parseInt(tickRate.toString()));
}

module.exports.connection = async function(socket = new Socket) {
	const thisUser = addUser(socket);

    socket.on('data', function(chunk) {
		const reader = new bufferStuff.Reader(chunk);

		const packetID = reader.readByte();

        switch(packetID) {
			case NamedPackets.KeepAlive:
				socket.write(new PacketMappingTable[NamedPackets.KeepAlive]().writePacket());
			break;

			case NamedPackets.LoginRequest:
				socket.write(new PacketMappingTable[NamedPackets.LoginRequest](reader.readInt(), reader.readString(), reader.readLong(), reader.readByte()).writePacket(thisUser.id));
				socket.write(new PacketMappingTable[NamedPackets.SpawnPosition]().writePacket());

				for (let x = -3; x < 4; x++) {
					for (let z = -3; z < 4; z++) {
						socket.write(new PacketMappingTable[NamedPackets.PreChunk](x, z, true).writePacket());
					}
				}

				// Place a layer of glass under the player so they don't fall n' die
				for (let x = 0; x < 16; x++) {
					for (let z = 0; z < 16; z++) {
						socket.write(new PacketMappingTable[NamedPackets.BlockChange](x, 64, z, 20, 0).writePacket());
					}
				}

				socket.write(new PacketMappingTable[NamedPackets.Player](true).writePacket());

				socket.write(new PacketMappingTable[NamedPackets.ChatMessage](`\u00A7e${thisUser.username} has joined the game`).writePacket());

				socket.write(new PacketMappingTable[NamedPackets.PlayerPositionAndLook](8.5, 65 + 1.6200000047683716, 65, 8.5, 0, 0, false).writePacket());

				thisUser.loginFinished = true;

				for (let x = -3; x < 4; x++) {
					for (let z = -3; z < 4; z++) {
						global.chunkManager.multiBlockChunk(x, z, thisUser);
					}
				}
			break;

			case NamedPackets.Handshake:
				thisUser.username = reader.readString();

				socket.write(new PacketMappingTable[NamedPackets.Handshake](thisUser.username).writePacket());
			break;

			case NamedPackets.ChatMessage:
				const message = reader.readString();
				// Hacky commands until I made a command system
				if (message.startsWith("/")) {
					const command = message.substring(1, message.length).split(" ");
					console.log(command);
					if (command[0] == "time") {
						if (command.length < 2) {
						} else if (command[1] == "set") {
							if (command.length < 3) {
							} else {
								switch (command[2]) {
									case "day":
										tickCounter = (BigInt(24000) * (tickCounter / BigInt(24000)));
									break;

									case "noon":
										tickCounter = (BigInt(24000) * (tickCounter / BigInt(24000))) + BigInt(6000);
									break;

									case "sunset":
										tickCounter = (BigInt(24000) * (tickCounter / BigInt(24000))) + BigInt(12000);
									break;

									case "midnight":
										tickCounter = (BigInt(24000) * (tickCounter / BigInt(24000))) + BigInt(18000);
									break;
								}
							}
						}
					}
				} else {
					// Send player's message to all players
					const cachedPacket = new PacketMappingTable[NamedPackets.ChatMessage](`<${thisUser.username}> ${message}`).writePacket();
					for (let key of netUserKeys) {
						netUsers[key].socket.write(cachedPacket);
					}
				}
			break;

			case NamedPackets.Player:
				
			break;

			default:
				console.log("0x" + packetID.toString(16));
			break;
		}
	});

	socket.on('end', function() {
        console.log("Connection closed");
		removeUser(thisUser.id);
	});

	socket.on('error', function(err) {
        console.log("Connection error!");
		removeUser(thisUser.id);
	});
}