const server = new (require('net').Server)();
const config = require("./config.json");

server.listen(config.port, function() {

});

server.on('connection', function(socket) {
	socket.on('data', function(chunk) {

	});

	socket.on('end', function() {

	});

	socket.on('error', function(err) {

	});
});