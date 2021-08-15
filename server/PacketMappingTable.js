const Packet0KeepAlive = require("./Packets/Packet0KeepAlive.js"),
	  Packet1LoginRequest = require("./Packets/Packet1LoginRequest.js"),
	  Packet2Handshake = require("./Packets/Packet2Handshake.js"),
	  Packet3Chat = require("./Packets/Packet3Chat.js"),
	  Packet4TimeUpdate = require("./Packets/Packet4TimeUpdate"),
	  Packet6SpawnPosition = require("./Packets/Packet6SpawnPosition.js"),
	  Packet10Player = require("./Packets/Packet10Player.js"),
	  Packet13PlayerPositionAndLook = require("./Packets/Packet13PlayerPositionAndLook.js"),
	  Packet50PreChunk = require("./Packets/Packet50PreChunk.js"),
	  Packet53BlockChange = require("./Packets/Packet53BlockChange.js");

const mappingTable = {
	0x00: Packet0KeepAlive,
	0x01: Packet1LoginRequest,
	0x02: Packet2Handshake,
	0x03: Packet3Chat,
	0x04: Packet4TimeUpdate,
	0x06: Packet6SpawnPosition,
	0x0A: Packet10Player,
	0x0D: Packet13PlayerPositionAndLook,
	0x32: Packet50PreChunk,
	0x35: Packet53BlockChange,
};

module.exports = mappingTable;