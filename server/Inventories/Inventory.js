const ItemStack = require("../ItemStack.js");

module.exports = class {
	constructor() {
		this.Slots = {};
	}

	saveData() {

	}

	loadData() {

	}

	getSlot(slot = 0) {
		return this.Slots[slot]; // If the slot doesn't exist well sucks to be you I guess! Haha :Þ
	}

	setSlot(slot = 0, itemStack = new ItemStack) {
		this.Slots[slot] = itemStack;
	}
}