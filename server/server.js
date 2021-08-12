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

global.chunkManager = new ChunkManager();
global.generatingChunks = false;

let tickInterval, tickCounter = BigInt(0);
let tickRate = BigInt(20);

module.exports.init = function(config) {
	config = config;
    console.log(`Up! Running at 0.0.0.0:${config.port}`);

	tickInterval = setInterval(() => {
		// Update Chunks
		if (!global.generatingChunks) {
			let itemsToRemove = [];
			for (let i = 0; i < Math.min(global.chunkManager.queuedBlockUpdates.getLength(), 128); i++) {
				const chunkUpdateKey = global.chunkManager.queuedBlockUpdates.itemKeys[i];
				const chunkUpdate = global.chunkManager.queuedBlockUpdates.items[chunkUpdateKey];
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

		// Update users
		for (let key of netUserKeys) {
			const user = netUsers[netUserKeys];

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

		tickCounter++;
	}, 1000 / parseInt(tickRate.toString()));
}

module.exports.connection = async function(socket = new Socket) {
	const thisUser = addUser(socket);

    socket.on('data', function(chunk) {
		const reader = new bufferStuff.Reader(chunk);

        switch(reader.readByte()) {
			case NamedPackets.KeepAlive:
				socket.write(new PacketMappingTable[NamedPackets.KeepAlive]().writePacket());
			break;

			case NamedPackets.LoginRequest:
				socket.write(new PacketMappingTable[NamedPackets.LoginRequest](reader.readInt(), reader.readString(), reader.readLong(), reader.readByte()).writePacket(thisUser.id));
				socket.write(new PacketMappingTable[NamedPackets.SpawnPosition]().writePacket());

				const dt = new Date().getTime();
				for (let x = -3; x < 4; x++) {
					for (let z = -3; z < 4; z++) {
						socket.write(new PacketMappingTable[NamedPackets.PreChunk](x, z, true).writePacket());
					}
				}
				console.log("Chunk packet generation took " + (new Date().getTime() - dt) + "ms");
				socket.write(new PacketMappingTable[NamedPackets.BlockChange](8, 64, 8, 20, 0).writePacket());

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