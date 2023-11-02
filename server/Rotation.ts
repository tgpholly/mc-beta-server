import { Vec2 } from "./Vec2";

export class Rotation extends Vec2 {
	public get yaw() {
		return this.x;
	}

	public set yaw(value:number) {
		this.x = value;
	}

	public get pitch() {
		return this.y;
	}

	public set pitch(value:number) {
		this.y = value;
	}
}