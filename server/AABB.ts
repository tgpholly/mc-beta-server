import FunkyArray from "funky-array";
import Vec3 from "./Vec3";

// Based on this MDN article:
// https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection
export default class AABB {
	private static readonly aabbPool:FunkyArray<string, AABB> = new FunkyArray<string, AABB>();

	public readonly aabbPoolString:string;
	public readonly pooled:boolean;

	public initMin:Vec3;
	public initMax:Vec3;

	public min:Vec3;
	public max:Vec3;

	public constructor(minXOrMin:Vec3 | number, minYOrMax:Vec3 | number, minZ?:number, maxX?:number, maxY?:number, maxZ?:number, pooled:boolean = false) {
		if (minXOrMin instanceof Vec3 && minYOrMax instanceof Vec3) {
			this.min = minXOrMin;
			this.max = minYOrMax;
		} else if (typeof(minXOrMin) === "number" && typeof(minYOrMax) === "number" && typeof(minZ) === "number" && typeof(maxX) === "number" && typeof(maxY) === "number" && typeof(maxZ) === "number") {
			this.min = new Vec3(minXOrMin, minYOrMax, minZ);
			this.max = new Vec3(maxX, maxY, maxZ);
		} else {
			throw new Error("Invalid input parameters: AABB must be supplied with either two Vec3 with the min and max bounds or the raw bounds.");
		}

		this.initMin = new Vec3(this.min);
		this.initMax = new Vec3(this.max);

		this.pooled = pooled;
		
		this.aabbPoolString = AABB.createAABBPoolString(this.min.x, this.min.y, this.min.z, this.max.x, this.max.y, this.max.z);
		if (!AABB.aabbPool.has(this.aabbPoolString)) {
			AABB.aabbPool.set(this.aabbPoolString, this);
		}
	}

	public static createAABBPoolString(minX:number, minY:number, minZ:number, maxX:number, maxY:number, maxZ:number) {
		return `m${minX}c${minY}a${minZ}a${maxX}b${maxY}b${maxZ}`;
	}

	public static getAABB(minX:number, minY:number, minZ:number, maxX:number, maxY:number, maxZ:number) {
		const aabbPoolString = this.createAABBPoolString(minX, minY, minZ, maxX, maxY, maxZ);
		if (AABB.aabbPool.has(aabbPoolString)) {
			const aabb = AABB.aabbPool.get(aabbPoolString);
			if (aabb === undefined) {
				throw new Error(`Pooled AABB was ${typeof(aabb)}! This should be impossible.`);
			}
			
			return aabb;
		}

		return new AABB(minX, minY, minZ, maxX, maxY, maxZ);
	}

	public static intersects(a:AABB, b:AABB) {
		return a.min.x <= b.max.x && a.max.x >= b.min.x && a.min.y <= b.max.y && a.max.y >= b.min.y && a.min.z <= b.max.z && a.max.z >= b.min.z;
	}

	public intersects(aabb:AABB) {
		return this.min.x <= aabb.max.x && this.max.x >= aabb.min.x && this.min.y <= aabb.max.y && this.max.y >= aabb.min.y && this.min.z <= aabb.max.z && this.max.z >= aabb.min.z;
	}

	public static intersectionY(a: AABB, b: AABB) {
		const minY = Math.max(a.min.y, b.min.y);
		const maxY = Math.min(a.max.y, b.max.y);

		return minY <= maxY ? maxY - minY : 0;
	}

	public intersectionY(aabb: AABB) {
		const minY = Math.max(this.min.y, aabb.min.y);
		const maxY = Math.min(this.max.y, aabb.max.y);

		return minY <= maxY ? maxY - minY : 0;
	}

	public static intersectionX(a: AABB, b: AABB) {
		const minX = Math.max(a.min.x, b.min.x);
		const maxX = Math.min(a.max.x, b.max.x);
	
		return minX <= maxX ? maxX - minX : 0;
	}
	
	public intersectionX(aabb: AABB) {
		const minX = Math.max(this.min.x, aabb.min.x);
		const maxX = Math.min(this.max.x, aabb.max.x);
	
		return minX <= maxX ? maxX - minX : 0;
	}
	
	public static intersectionZ(a: AABB, b: AABB) {
		const minZ = Math.max(a.min.z, b.min.z);
		const maxZ = Math.min(a.max.z, b.max.z);
	
		return minZ <= maxZ ? maxZ - minZ : 0;
	}
	
	public intersectionZ(aabb: AABB) {
		const minZ = Math.max(this.min.z, aabb.min.z);
		const maxZ = Math.min(this.max.z, aabb.max.z);
	
		return minZ <= maxZ ? maxZ - minZ : 0;
	}

	public move(xOrVec3:Vec3 | number, y?:number, z?:number) {
		if (this.pooled) {
			throw new Error(`Attempted to move a pooled AABB. This is not allowed!`);
		}

		this.min.set(this.initMin);
		this.max.set(this.initMax);
		if (xOrVec3 instanceof Vec3) {
			this.min.add(xOrVec3);
			this.max.add(xOrVec3);
		} else if (typeof(xOrVec3) === "number" && typeof(y) === "number" && typeof(z) === "number") {
			this.min.add(xOrVec3, y, z);
			this.max.add(xOrVec3, y, z);
		}
	}
}