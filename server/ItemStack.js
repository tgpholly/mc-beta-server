module.exports = class {
	constructor(id, count) {
		this.id = id;
		this.count = count;
	}

	updateCount(count) {
		this.count += count;
	}
}