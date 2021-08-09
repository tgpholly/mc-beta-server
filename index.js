const net = require('net');
const port = 25565;

const { createGzip, deflate } = require("zlib");

const chunk = require("./chunk.js");

const myman = require("./bufferStuff.js");

const server = new net.Server();

const protocolVersion = 14;

server.listen(port, function() {
    console.log(`Server listening for connection requests on socket localhost:${port}`);
});

server.on('connection', function(socket) {
    console.log('A new connection has been established.');

    //socket.write('Hello, client.');

    socket.on('data', function(chunk) {
        //console.log(chunk);

		const reader = new myman.Reader(chunk);

		const id = reader.readByte();

		console.log(`ID: ${id}`);
		switch (id) {
			case 0:
				keepAlive(socket);
				break;

			case 1:
				loginRequest(socket, reader);
				break;

			case 2:
				handshake(socket, reader);
				break;

			case 0x0B:
				playerLook(socket, reader);
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

function keepAlive(socket) {
	const writer = new myman.Writer();

	writer.writeByte(0x00);

	socket.write(writer.buffer);
}

function loginRequest(socket, reader = new myman.Reader) {
	const proto = reader.readInt();
	const username = reader.readString();
	const mapSeed = reader.readLong();
	const dimension = reader.readByte();

	console.log("Protocol Version: " + proto);
	console.log("Username: " + username);
	
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
}

function handshake(socket, reader = new myman.Reader) {
	const username = reader.readString();

	const writer = new myman.Writer();

	writer.writeByte(0x02);

	writer.writeString("-");

	socket.write(writer.buffer);
}

function playerLook(socket, reader = new myman.Reader) {
	const x = reader.readDouble();
	const y = reader.readDouble();
	const stance = reader.readDouble();
	const z = reader.readDouble();
	const onGround = reader.readBool();

	/*console.log("X: " + x);
	console.log("Y: " + y);
	console.log("Z: " + z);
	console.log("Stance: " + stance);
	console.log("On Ground: " + onGround);*/
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

function writeChunk() {
	const writer = new myman.Writer();

	writer.writeByte(0x33); // ID
	writer.writeInt(0);		// Chunk X
	writer.writeShort(0);	// Chunk Y
	writer.writeByte(15);	// Chunk Z
	writer.writeByte(127);	// Chunk Size X
	writer.writeByte(15);	// Chunk Size Y
	writer.writeInt(5);		// Chunk Size Z
}