export default class MathUtil {
	public static Map(value:number, inMin:number, inMax:number, outMin:number, outMax:number): number {
		return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
	}

	public static Clamp(value:number, min:number, max:number): number {
		return Math.min(Math.max(value, min), max);
	}

	public static Interpolate(points: readonly [number, number][], x: number): number {
		if (x <= points[0][0]) {
			return points[0][1];
		}
		if (x >= points[points.length - 1][0]) {
			return points[points.length - 1][1];
		}

		for (let i = 0; i < points.length - 1; i++) {
			const [x0, y0] = points[i];
			const [x1, y1] = points[i + 1];

			if (x >= x0 && x <= x1) {
				const t = (x - x0) / (x1 - x0);
				return y0 + t * (y1 - y0);
			}
		}

		throw new Error("fuck");
	}
}