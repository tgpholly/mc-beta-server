const net = require('net');
const port = 25565;

const { createGzip, deflateSync } = require("zlib");

const chunk = require("./chunk.js");

const myman = require("./bufferStuff.js");

const users = [];

let entID = 1;

const enities = [];

//let sendQueue = [];

setInterval(() => {
	for (let user of users) {
		if (!user[7]) continue;

		for (let i = 0; i < Math.min(user[9].length, 64); i++) {
			user[1].write(user[9][i]);
		}
	
		for (let i = 0; i < Math.min(user[9].length, 64); i++) {
			user[9].splice(0, 1);
		}
	}
}, 1000 / 40);

let chunks = {};

let queuedChunk = [];

function createFlatChunk(cx, cz) {
	if (chunks[cx] == null) chunks[cx] = {};
	chunks[cx][cz] = {};

	for (let y = 0; y < 128; y++) {
		chunks[cx][cz][y] = {};
		for (let x = 0; x < 16; x++) {
			chunks[cx][cz][y][x] = [];
			for (let z = 0; z < 16; z++) {
				if (y == 64) {
					chunks[cx][cz][y][x].push(2);
					if (Math.random() <= 0.01) {
						queuedChunk.push([17, cx, cz, x, y + 1, z]);
						queuedChunk.push([17, cx, cz, x, y + 2, z]);
						queuedChunk.push([17, cx, cz, x, y + 3, z]);
						queuedChunk.push([17, cx, cz, x, y + 4, z]);
					}
				} else if (y == 63 || y == 62) {
					chunks[cx][cz][y][x].push(3);
				} else if (y == 0) {
					chunks[cx][cz][y][x].push(7);
				} else if (y < 62) {
					chunks[cx][cz][y][x].push(1);
				} else {
					chunks[cx][cz][y][x].push(0);
				}
			}
		}
	}

	for (let things of queuedChunk) {
		chunks[things[1]][things[2]][things[4]][things[3]][things[5]] = things[0];
	}
}

function addUser(socket, username) {
	const thething = [entID, socket, username, false, [-2890438704, -2345654261, -8972334789], [0, 0], null, false, [0, 0], []];
	entID++;
	users.push(thething);
	return thething;
}

const server = new net.Server();

const protocolVersion = 14;

server.listen(port, function() {
	for (let x = -3; x < 4; x++) {
		for (let z = -3; z < 4; z++) {
			createFlatChunk(x, z);
		}
	}

    console.log(`Server listening for connection requests on socket localhost:${port}`);
});

setInterval(() => {
	// Server tick interval
	for (let tickUser of users) {
		if (!tickUser[7]) continue;

		if (tickUser[6] == null) {

			const writer = new myman.Writer();

			writer.writeByte(0x22);
			writer.writeInt(tickUser[0]);
			writer.writeInt(Math.floor(tickUser[4][0] * 32));
			writer.writeInt(Math.floor(tickUser[4][1] * 32));
			writer.writeInt(Math.floor(tickUser[4][2] * 32));
			writer.writeByte(Math.floor((tickUser[5][0] * 256) / 360));
			writer.writeByte(Math.floor((tickUser[5][1] * 256) / 360));

			for (let user of users) {
				if (user[0] == tickUser[0]) continue;

				user[1].write(writer.buffer);
			}

			tickUser[6] = [tickUser[4][0], tickUser[4][1], tickUser[4][2]];
		} else {
			if (tickUser[4][0] != tickUser[6][0] || tickUser[4][1] != tickUser[6][1] || tickUser[4][2] != tickUser[6][2]) {
				/*const relX = Math.floor(((tickUser[4][0] - tickUser[6][0]) * 32));
				const relY = Math.floor(((tickUser[4][1] - tickUser[6][1]) * 32));
				const relZ = Math.floor(((tickUser[4][2] - tickUser[6][2]) * 32));*/
	
				const writer = new myman.Writer();
	
				//if ((relX < -128 || relX >= 128 || relY < -128 || relY >= 128 || relZ < -128 || relZ >= 128 )) {
					writer.writeByte(0x22);
					writer.writeInt(tickUser[0]);
					writer.writeInt(Math.floor(tickUser[4][0] * 32));
					writer.writeInt(Math.floor(tickUser[4][1] * 32));
					writer.writeInt(Math.floor(tickUser[4][2] * 32));
					writer.writeByte(Math.floor((tickUser[5][0] * 256) / 360));
					writer.writeByte(Math.floor((tickUser[5][1] * 256) / 360));
				/*} else {
					writer.writeByte(0x1F);
					writer.writeInt(tickUser[0]);
					writer.writeByte(-relX);
					writer.writeByte(relY);
					writer.writeByte(-relZ);
				}*/
	
				for (let user of users) {
					if (user[0] == tickUser[0]) continue;
	
					user[1].write(writer.buffer);
				}

				tickUser[6][0] = tickUser[4][0];
				tickUser[6][1] = tickUser[4][1];
				tickUser[6][2] = tickUser[4][2];
			}
		}
	}
}, 1000 / 20);

server.on('connection', function(socket) {
    console.log('A new connection has been established.');

    //socket.write('Hello, client.');

	const me = addUser(socket, null);

    socket.on('data', function(chunk) {
        //console.log(chunk);

		const reader = new myman.Reader(chunk);

		const id = reader.readByte();

		//console.log(`ID: ${id}`);
		switch (id) {
			case 0:
				keepAlive(socket);
				break;

			case 1:
				loginRequest(socket, reader, me);
				break;

			case 2:
				handshake(socket, reader);
				break;

			case 3:
				sendChat(reader, me);
				break;

			case 0x0A:

				break;

			case 0x0B:
				playerPos(reader, me);
				break;

			case 0x0C:
				playerLook(reader, me);
				break;

			case 0x0D:
				playerPos(reader, me);
				break;

			case 0x0E:
				breakBlock(socket, reader);
				break;

			default:
				console.log(`ID: ${id}`);
				break;
		}
    });

    socket.on('end', function() {
        console.log('Closing connection with the client');
    });

    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });
});

function keepAlive(socket, reader = new myman.Reader) {
	//const thething = reader.readInt();

	const writer = new myman.Writer();

	writer.writeByte(0x00);
	//writer.writeInt(thething);

	socket.write(writer.buffer);
}

function loginRequest(socket, reader = new myman.Reader, me = [0, null, ""]) {
	const proto = reader.readInt();
	const username = reader.readString();
	const mapSeed = reader.readLong();
	const dimension = reader.readByte();

	console.log("Protocol Version: " + proto);
	console.log("Username: " + username);
	
	me[2] = username;

	const writer = new myman.Writer();

	writer.writeByte(0x01);

	writer.writeInt(1);
	writer.writeString("");
	writer.writeLong(971768181197178410);
	writer.writeByte(0);

	socket.write(writer.buffer);

	writer.buffer = Buffer.alloc(0);

	writer.writeByte(0x06);

	writer.writeInt(0);
	writer.writeInt(65);
	writer.writeInt(0);

	socket.write(writer.buffer);

	//writeChunk(socket);
	for (let x = -3; x < 4; x++) {
		for (let z = -3; z < 4; z++) {
			preChunk(socket, x, z, true);
			sendChunk(socket, x, z, me);
		}
	}

	/*for (let x = 0; x < 16; x++) {
		for (let z = 0; z < 16; z++) {
			writer.reset();
			writer.writeByte(0x35);

			writer.writeInt(x);
			writer.writeByte(64); // 63 == 64 because the y byte has 1 subtracted from it
			writer.writeInt(z);
			writer.writeByte(2);  // Block ID
			writer.writeByte(0);  // Metadata
			socket.write(writer.buffer);
		}
	}*/

	writer.reset();
	writer.writeByte(0x35);

	writer.writeInt(8);
	writer.writeByte(64); // 63 == 64 because the y byte has 1 subtracted from it
	writer.writeInt(8);
	writer.writeByte(20);  // Block ID
	writer.writeByte(0);  // Metadata
	socket.write(writer.buffer);
	
	writer.buffer = Buffer.alloc(0);

	writer.writeByte(0x0A);

	writer.writeBool(true);

	socket.write(writer.buffer);

	sendMessage(`\u00A7e${username} has joined the game`);

	me[3] = true;

	writer.buffer = Buffer.alloc(0);

	// Spawn this player for other players
	writer.writeByte(0x14);
	writer.writeInt(me[0]);
	writer.writeString(me[2]);
	writer.writeInt(0);
	writer.writeInt(65 * 32);
	writer.writeInt(0);
	writer.writeByte(0);
	writer.writeByte(0);
	writer.writeShort(0);

	for (let user of users) {
		if (user[0] == me[0]) continue;

		user[1].write(writer.buffer);
	}

	// Send other players to this player
	for (let user of users) {
		if (user[0] == me[0]) continue;

		writer.reset();

		writer.writeByte(0x14);
		writer.writeInt(user[0]);
		writer.writeString(user[2]);
		writer.writeInt(0);
		writer.writeInt(65 * 32);
		writer.writeInt(0);
		writer.writeByte(0);
		writer.writeByte(0);
		writer.writeShort(0);

		socket.write(writer.buffer);
	}

	// spawned player equipment
	for (let i = 0; i < 5; i++) {
		writer.buffer = Buffer.alloc(0);

		writer.writeByte(0x05);
		writer.writeInt(me[0]);
		writer.writeShort(i);
		writer.writeShort(-1);
		writer.writeShort(0);

		for (let user of users) {
			if (user[0] == me[0]) continue;
	
			user[1].write(writer.buffer);
		}
	}

	if (me[3]) teleportPlayer(me[1], 8.5, 67 + 1.6200000047683716, 67, 8.5, -180 * (me[0] - 1), 0);
}

function handshake(socket, reader = new myman.Reader) {
	const username = reader.readString();

	const writer = new myman.Writer();

	writer.writeByte(0x02);

	writer.writeString("-");

	socket.write(writer.buffer);
}

function sendChat(reader = new myman.Reader, sender) {
	const message = reader.readString();

	if (message.length < 120) {
		const writer = new myman.Writer();

		writer.writeByte(0x03);

		if (sender != null) writer.writeString(`<${sender[2]}> ${message}`);

		for (let user of users) {
			user[1].write(writer.buffer);
		}
	}
}

function sendMessage(message = "") {
	if (message.length < 120) {
		const writer = new myman.Writer();

		writer.writeByte(0x03);

		writer.writeString(message);

		for (let user of users) {
			user[1].write(writer.buffer);
		}
	}
}

function playerPos(reader = new myman.Reader, me) {
	const x = reader.readDouble();
	const y = reader.readDouble();
	const stance = reader.readDouble();
	const z = reader.readDouble();
	//const onGround = reader.readBool();

	/*console.log("X: " + );
	console.log("Y: " + );
	console.log("Z: " + );
	console.log("Stance: " + stance);
	console.log("On Ground: " + onGround);*/

	/*const writer = new myman.Writer();

	const shouldTeleport = (Math.abs(Math.floor(x * 32)) >= 8 || Math.abs(Math.floor(y * 32)) >= 8 || Math.abs(Math.floor(z * 32)) >= 8);

	const relX = Math.floor(((x - me[4][0]) * 32));
	const relY = Math.floor(((y - me[4][1]) * 32));
	const relZ = Math.floor(((z - me[4][2]) * 32));*/

	/*if ((relX < -128 || relX >= 128 || relY < -128 || relY >= 128 || relZ < -128 || relZ >= 128 )) {
		writer.writeByte(0x22);
		writer.writeInt(me[0]);
		writer.writeInt(Math.floor(x * 32));
		writer.writeInt(Math.floor(y * 32));
		writer.writeInt(Math.floor(z * 32));
		writer.writeByte(Math.floor((me[5][0] * 256) / 360));
		writer.writeByte(Math.floor((me[5][1] * 256) / 360));
	} else {
		writer.writeByte(0x1F);
		writer.writeInt(me[0]);
		writer.writeByte(-relX);
		writer.writeByte(relY);
		writer.writeByte(-relZ);
	}*/

	/*for (let user of users) {
		if (user[0] == me[0]) continue;

		user[1].write(writer.buffer);
	}*/

	me[7] = true;

	me[4][0] = x;
	me[4][1] = y;
	me[4][2] = z;
}

function playerLook(reader = new myman.Reader, me) {
	const yaw = reader.readFloat();
	const pitch = reader.readFloat();
}

function breakBlock(socket, reader = new myman.Reader) {
	const status = reader.readByte();
	const x = reader.readInt();
	const y = reader.readByte();
	const z = reader.readInt();
	const face = reader.readByte();

	/*let offsetX = 0, offsetY = 0, offsetZ = 0;

	switch (face) {
		case 0: offsetY = -1; break;
		case 1: offsetY = 1; break;
		case 2: offsetZ = -1; break;
		case 3: offsetZ = 1; break;
		case 4: offsetX = -1; break;
		case 5: offsetX = 1; break;
	}*/

	const chunkX = Math.floor(x / 16);
	const chunkZ = Math.floor(z / 16);

	const blockX = x - (16 * chunkX);
	const blockZ = z - (16 * chunkZ);

	console.log(chunks[chunkX][chunkZ][y][blockX][blockZ])
	chunks[chunkX][chunkZ][y][blockX][blockZ] = 0;

	const writer = new myman.Writer();

	writer.writeByte(0x35);
	writer.writeInt(x);
	writer.writeByte(y); // 63 == 64 because the y byte has 1 subtracted from it
	writer.writeInt(z);
	writer.writeByte(0);  // Block ID
	writer.writeByte(0);  // Metadata
	//socket.write(writer.buffer);

	for (let user of users) {
		user[1].write(writer.buffer);
	}
}

// Write

function preChunk(socket, x, y, load = false) {
	const writer = new myman.Writer();

	writer.writeByte(0x32);
	writer.writeInt(x);
	writer.writeInt(y);
	writer.writeBool(load);

	socket.write(writer.buffer);
}

function writeChunk(socket) {
	const writer = new myman.Writer();

	writer.writeByte(0x33); // ID
	
	const chank = new chunk(0, 0);

	const buf = Buffer.alloc((15 * 127 * 15 * 5) / 2);

	const defl = deflateSync(chank.getChunkData(0, 0, 0, 15, 127, 15), {level:-1});

	writer.writeInt(0);		// Chunk X
	writer.writeShort(0);	// Chunk Y
	writer.writeInt(0);		// Chunk Z
	writer.writeByte(15);	// Chunk Size X	
	writer.writeByte(127);	// Chunk Size Y
	writer.writeByte(15);	// Chunk Size Z
	writer.writeInt(defl.length);	// Compressed size
	console.log(defl.length);
	console.log(defl.toString());
	for (let i = 0; i < defl.length; i++) {
		writer.writeByte(defl[i] - 128);	// Compressed data
	}

	socket.write(writer.buffer);
}

function teleportPlayer(socket, x = 0.0, y = 1.6200000047683716, stance = 0.0, z = 0.0, yaw = 0.0, pitch = 0.0) {
	const writer = new myman.Writer();

	writer.writeByte(0x0D);	// Player pos and view direction

	writer.writeDouble(x);
	writer.writeDouble(stance);
	writer.writeDouble(y);
	writer.writeDouble(z);
	writer.writeFloat(yaw);
	writer.writeFloat(pitch);
	writer.writeBool(false);

	socket.write(writer.buffer);
}

function sendChunk(socket, chunkX = 0, chunkZ = 0, me = []) {
	const writer = new myman.Writer();

	// I couldn't figure out how to construct a chunk lmao
	// ima just send each block individually 
	// TODO: yknow, figure out how to chunk.
	let blocksToSend = [];
	for (let y = 0; y < 128; y++) {
		blocksToSend = [];
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				if (chunks[chunkX][chunkZ][y][x][z] == 0) continue; // don't send air lol
				blocksToSend.push([chunks[chunkX][chunkZ][y][x][z], x & 0xf, z & 0xf]);
			}
		}

		if (blocksToSend.length > 0) {
			writer.reset();
			writer.writeByte(0x34);
			writer.writeInt(chunkX);
			writer.writeInt(chunkZ);
			writer.writeShort(blocksToSend.length);
			// Block coords
			for (let blocks of blocksToSend) {
				writer.writeShort((blocks[1] << 12 | blocks[2] << 8 | y) - 32768);
			}
			// Block types
			for (let blocks of blocksToSend) {
				writer.writeByte(blocks[0]);
			}
			// Block metadata
			for (let blocks of blocksToSend) {
				writer.writeByte(0);
			}

			me[9].push(writer.buffer) // so we don't flood the client queue these
		}
	}
}