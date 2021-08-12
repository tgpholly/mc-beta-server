const funkyArray = require("./Util/funkyArray.js");

const Socket = require("net").Socket;

module.exports = class {
	constructor(id = 1, socket = new Socket) {
		this.id = id;
		this.socket = socket;

		this.username = "UNNAMED";

		this.loginFinished = false;

		this.chunksToSend = new funkyArray();
	}
}