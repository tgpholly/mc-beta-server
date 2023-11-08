import { FunkyArray } from "../funkyArray";
import Vec3 from "./Vec3";

// Based on this MDN article:
// https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection
export default class AABB {
	private static readonly aabbPool:FunkyArray<string, AABB> = new FunkyArray<string, AABB>();

	public readonly aabbPoolString:string;

	public min:Vec3;
	public max:Vec3;

	public constructor(minXOrMin:Vec3 | number, minYOrMax:Vec3 | number, minZ?:number, maxX?:number, maxY?:number, maxZ?:number) {
		if (minXOrMin instanceof Vec3 && minYOrMax instanceof Vec3) {
			this.min = minXOrMin;
			this.max = minYOrMax;
		} else if (typeof(minXOrMin) === "number" && typeof(minYOrMax) === "number" && typeof(minZ) === "number" && typeof(maxX) === "number" && typeof(maxY) === "number" && typeof(maxZ) === "number") {
			this.min = new Vec3(minXOrMin, minYOrMax, minZ);
			this.max = new Vec3(maxX, maxY, maxZ);
		} else {
			throw new Error("Invalid input parameters: AABB must be supplied with either two Vec3 with the min and max bounds or the raw bounds.");
		}
		
		this.aabbPoolString = AABB.createAABBPoolString(this.min.x, this.min.y, this.min.z, this.max.x, this.max.y, this.max.z);
		if (!AABB.aabbPool.has(this.aabbPoolString)) {
			AABB.aabbPool.set(this.aabbPoolString, this);
		}
		
		console.log(this);
	}

	public static createAABBPoolString(minX:number, minY:number, minZ:number, maxX:number, maxY:number, maxZ:number) {
		return `m${minX}c${minY}a${minZ}a${maxX}b${maxY}b${maxZ}`;
	}

	public static getAABB(minX:number, minY:number, minZ:number, maxX:number, maxY:number, maxZ:number) {
		const aabbPoolString = this.createAABBPoolString(minX, minY, minZ, maxX, maxY, maxZ);
		if (!AABB.aabbPool.has(aabbPoolString)) {
			return AABB.aabbPool.get(aabbPoolString);
		}

		return new AABB(minX, minY, minZ, maxX, maxY, maxZ);
	}

	intersects(a:AABB, b:AABB) {
		return a.min.x <= b.max.x && a.max.x >= b.min.x && a.min.y <= b.max.y && a.max.y >= b.min.y && a.min.z <= b.max.z && a.max.z >= b.min.z;
	}

	intersectionAmount(a:AABB, b:AABB) {

	}
}