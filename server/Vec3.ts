export default class Vec3 {
	public x:number;
	public y:number;
	public z:number;

	public constructor(x?:Vec3 | number, y?:number, z?:number) {
		if (typeof(x) === "number" && typeof(y) === "number" && typeof(z) === "number") {
			this.x = x;
			this.y = y;
			this.z = z;
		} else if (typeof(x) === "number" && typeof(y) !== "number" && typeof(z) !== "number") {
			this.x = x;
			this.y = x;
			this.z = x;
		} else if (x instanceof Vec3) {
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
		} else {
			this.x = this.y = this.z = 0;
		}
	}

	public get isZero() {
		return this.x === 0 && this.y === 0 && this.z === 0;
	}

	public set(x?:Vec3 | number, y?:number, z?:number) {
		if (x instanceof Vec3) {
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
		} else if (typeof(x) === "number" && typeof(y) === "number" && typeof(z) === "number") {
			this.x = x;
			this.y = y;
			this.z = z;
		} else {
			throw new Error(`Invalid arguments for Vec3.set : ${typeof(x)}, ${typeof(y)}, ${typeof(z)}`);
		}
	}

	add(x:Vec3 | number, y?:number, z?:number) {
		if (x instanceof Vec3) {
			this.set(this.x + x.x, this.y + x.y, this.z + x.z);
		} else if (typeof(x) === "number" && typeof(y) === "number" && typeof(z) === "number") {
			this.set(this.x + x, this.y + y, this.z + z);
		} else {
			throw new Error(`Invalid arguments for Vec3.add : ${typeof(x)}, ${typeof(y)}, ${typeof(z)}`);
		}
	}

	mult(x:Vec3 | number, y?:number, z?:number) {
		if (x instanceof Vec3) {
			this.set(this.x * x.x, this.y * x.y, this.z * x.z);
		} else if (typeof(x) === "number" && typeof(y) === "number" && typeof(z) === "number") {
			this.set(this.x * x, this.y * y, this.z * z);
		} else {
			throw new Error(`Invalid arguments for Vec3.mult : ${typeof(x)}, ${typeof(y)}, ${typeof(z)}`);
		}
	}
}