export class Vec3 {
	public x:number;
	public y:number;
	public z:number;

	public constructor(x?:number, y?:number, z?:number) {
		if (typeof(x) === "number" && typeof(y) === "number" && typeof(z) === "number") {
			this.x = x;
			this.y = y;
			this.z = z;
		} else if (typeof(x) === "number" && typeof(y) !== "number" && typeof(z) !== "number") {
			this.x = x;
			this.y = x;
			this.z = x;
		} else {
			this.x = this.y = this.z = 0;
		}
	}
}