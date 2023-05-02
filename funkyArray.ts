export class FunkyArray<T, TT> {
	private items:Map<T, TT> = new Map<T, TT>();
	private itemKeys:Array<T> = new Array<T>();

	private _getKeys() : Array<T> {
		const keyArray = new Array<T>();
		let result:IteratorResult<T, T>;
		const iterator = this.items.keys();
		while (!(result = iterator.next()).done) {
			keyArray.push(result.value);
		}
		return keyArray;
	}

	public set(key:T, item:TT, regenerate:boolean = true) : TT {
		this.items.set(key, item);
		if (regenerate) {
			this.itemKeys = this._getKeys();
		}
		return item;
	}

	public remove(key:T, regenerate:boolean = true) {
		const success = this.items.delete(key);
		if (regenerate) {
			this.itemKeys = this._getKeys();
		}
		return success;
	}

	public removeFirst(regenerate:boolean = true) {
		const success = this.items.delete(this.items.keys().next().value);
		if (regenerate) {
			this.itemKeys = this._getKeys();
		}
		return success;
	}

	public first() : TT {
		return this.items.values().next().value;
	}

	public get length() : number {
		return this.items.size;
	}

	public get(key:T) : TT | undefined {
		return this.items.get(key);
	}

	public has(key:T) : boolean {
		return this.itemKeys.includes(key);
	}

	public get keys() : Array<T> {
		return this.itemKeys;
	}

	public forEach(callback: (value:TT) => void) {
		return new Promise<boolean>((resolve, reject) => {
			if (this.items.size === 0) {
				return resolve(true);
			}

			try {
				const iterator = this.items.values();
				let result:IteratorResult<TT, TT>;
				while (!(result = iterator.next()).done) {
					callback(result.value);
				}
				resolve(true);
			} catch (e) {
				reject(e);
			}
		});
	}
}