const bufferStuff = require("./bufferStuff.js")

const Socket = require("net").Socket;

module.exports.init = function(config) {
    console.log(`Up! Running at 0.0.0.0:${config.port}`);
}

module.exports.connection = function(socket = new Socket) {
    socket.on('data', function(chunk) {
        console.log(chunk);
	});

	socket.on('end', function() {
        console.log("Connection closed");
	});

	socket.on('error', function(err) {
        console.log("Connection error!");
	});
}