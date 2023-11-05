export class Vec2 {
	public x:number;
	public y:number;

	public constructor(x?:Vec2 | number, y?:number) {
		if (typeof(x) === "number" && typeof(y) === "number") {
			this.x = x;
			this.y = y;
		} else if (typeof(x) === "number" && typeof(y) !== "number") {
			this.x = x;
			this.y = x;
		} else if (x instanceof Vec2) {
			this.x = x.x;
			this.y = x.y;
		} else {
			this.x = this.y = 0;
		}
	}

	public get isZero() {
		return this.x === 0 && this.y === 0;
	}

	public set(x?:Vec2 | number, y?:number) {
		if (x instanceof Vec2) {
			this.x = x.x;
			this.y = x.y;
		} else if (typeof(x) === "number" && typeof(y) === "number") {
			this.x = x;
			this.y = y;
		} else {
			this.x = this.y = 0;
		}
	}
}