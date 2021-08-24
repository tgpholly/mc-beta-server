/*
	===============- user.js -==============
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const funkyArray = require("./Util/funkyArray.js");

const Socket = require("net").Socket;

module.exports = class {
	constructor(id = 1, socket = new Socket) {
		this.id = id;
		this.socket = socket;

		this.username = "UNNAMED";

		this.loginFinished = false;

		this.entityRef = null;

		this.chunksToSend = new funkyArray();
	}
}