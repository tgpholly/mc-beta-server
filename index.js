const net = require('net');
const port = 25565;

const { createGzip, deflateSync } = require("zlib");

const chunk = require("./chunk.js");

const myman = require("./bufferStuff.js");

const users = [];

function addUser(socket, username) {
	const thething = [4 * users.length, socket, username, false, [-2890438704, -2345654261, -8972334789], [0, 0], null, false];
	users.push(thething);
	return thething;
}

const server = new net.Server();

const protocolVersion = 14;

server.listen(port, function() {
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
			if (Math.floor(tickUser[4][0]) != Math.floor(tickUser[6][0]) || Math.floor(tickUser[4][1]) != Math.floor(tickUser[6][1]) || Math.floor(tickUser[4][2]) != Math.floor(tickUser[6][2])) {
				const relX = Math.floor(((tickUser[4][0] - tickUser[6][0]) * 32));
				const relY = Math.floor(((tickUser[4][1] - tickUser[6][1]) * 32));
				const relZ = Math.floor(((tickUser[4][2] - tickUser[6][2]) * 32));
	
				const writer = new myman.Writer();
	
				if ((relX < -128 || relX >= 128 || relY < -128 || relY >= 128 || relZ < -128 || relZ >= 128 )) {
					writer.writeByte(0x22);
					writer.writeInt(tickUser[0]);
					writer.writeInt(Math.floor(tickUser[4][0] * 32));
					writer.writeInt(Math.floor(tickUser[4][1] * 32));
					writer.writeInt(Math.floor(tickUser[4][2] * 32));
					writer.writeByte(Math.floor((tickUser[5][0] * 256) / 360));
					writer.writeByte(Math.floor((tickUser[5][1] * 256) / 360));
				} else {
					writer.writeByte(0x1F);
					writer.writeInt(tickUser[0]);
					writer.writeByte(-relX);
					writer.writeByte(relY);
					writer.writeByte(-relZ);
				}
	
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

			case 0x0B:
				playerPos(reader, me);
				break;
		}

		//if (me[3]) teleportPlayer(me[1], 16 * me[0], 65 + 1.6200000047683716, 65, 0, -180 * (me[0] - 1), 0);
    });

    socket.on('end', function() {
        console.log('Closing connection with the client');
    });

    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });
});

function keepAlive(socket, reader = new myman.Reader) {
	const thething = reader.readInt();

	const writer = new myman.Writer();

	writer.writeByte(0x00);
	writer.writeInt(thething);

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

	preChunk(socket, 0, 0, true);

	//writeChunk(socket);

	writer.buffer = Buffer.alloc(0);

	writer.writeByte(0x0A);

	writer.writeBool(true);

	socket.write(writer.buffer);

	sendMessage(`\u00A7e${username} has joined the game`);

	me[3] = true;

	// I couldn't figure out how to construct a chunk lmao
	// ima just send each block individually 
	// TODO: yknow, figure out how to chunk.
	for (let x = 0; x < 16; x++) {
		for (let z = 0; z < 16; z++) {
			writer.reset();
			writer.writeByte(0x35);

			writer.writeInt(x);
			writer.writeByte(63); // 63 == 64 because the y byte has 1 subtracted from it
			writer.writeInt(z);
			writer.writeByte(1);  // Block ID
			writer.writeByte(0);  // Metadata
			socket.write(writer.buffer);
		}
	}

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
	const onGround = reader.readBool();

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