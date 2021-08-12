const server = new (require('net').Server)();
const config = require("./config.json");

const mcServer = require("./server/server.js");

server.listen(config.port, () => mcServer.init(config));

server.on('connection', mcServer.connection);