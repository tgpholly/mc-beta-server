/*
	===========- funkyArray.js -============
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const pRandom = require("./prettyRandom.js");

module.exports = class {
	constructor(indexingMode = false) {
		this.items = {};
		this.itemKeys = Object.keys(this.items);

		this.indexingMode = indexingMode;
		this.index = 0;

		this.iterableArray = [];
	}

	add(item, regenerate = true) {
		let id;
		if (this.indexingMode) {
			this.items[id = this.index] = item;
			this.index++;
		} else {
			this.items[id = pRandom()] = item;
		}

		if (regenerate) {
			this.regenerateIterableArray();
			this.itemKeys = Object.keys(this.items);
		}

		return this.items[id];
	}

	remove(id, regenerate = true) {
		delete this.items[id];
		if (regenerate) {
			this.regenerateIterableArray();
			this.itemKeys = Object.keys(this.items);
		}
	}

	removeFirstItem(regenerate = true) {
		delete this.items[this.itemKeys[0]];
		if (regenerate) this.regenerateIterableArray();
		this.itemKeys = Object.keys(this.items);
	}

	regenerateIterableArray() {
		this.iterableArray = new Array();
		for (let itemKey of this.itemKeys) {
			this.iterableArray.push(this.items[itemKey]);
		}
		this.itemKeys = Object.keys(this.items);
	}

	getFirstItem() {
		return this.items[this.itemKeys[0]];
	}

	getLength() {
		return this.itemKeys.length;
	}

	getKeyById(id) {
		return this.itemKeys[id];
	}

	getById(id) {
		return this.items[this.itemKeys[id]];
	}

	getByKey(key) {
		return this.items[key];
	}

	getKeys() {
		return this.itemKeys;
	}

	getItems() {
		return this.items;
	}

	getIterableItems() {
		return this.iterableArray;
	}
}