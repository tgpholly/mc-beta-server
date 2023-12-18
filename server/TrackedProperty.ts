export class TrackedProperty<T> {
	private trackedValue?:T;
	private updateCallback?:(value:T) => void;

	constructor(initialValue?:T) {
		this.trackedValue = initialValue;
	}

	public set OnChange(value:() => void) {
		this.updateCallback = value;
	}

	public get Value() {
		return this.trackedValue;
	}

	public set Value(value) {
		this.trackedValue = value;
		if (this.updateCallback && value) {
			this.updateCallback(value);
		}
	}
}