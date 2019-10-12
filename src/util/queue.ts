import { enumerate, notUndefined } from "./util"

export class Queue<T> implements Iterable<T> {
	private data: (T | undefined)[] = []
	// begin is inclusive, end is exclusive
	// When end = begin, queue is empty
	// When (end + 1) % len = begin, we'll treat queue as full.
	// That means we can never be completely full,
	// since data[end] is not written to.
	private begin: number = 0
	private end: number = 0

	pushRight(value: T): void {
		const len = this.data.length
		if (len === 0) {
			this.data = [value, undefined]
			this.begin = 0
			this.end = 1
		} else {
			const newEnd = (this.end + 1) % len
			if (newEnd === this.begin) {
				// Full, must resize
				const newData = new Array(len * 2)
				const oldSize = this.size
				for (const [i, x] of enumerate(this))
					newData[i] = x
				this.data = newData
				this.begin = 0
				this.data[oldSize] = value
				this.end = oldSize + 1
			} else {
				this.data[this.end] = value
				this.end = newEnd
			}
		}
	}

	peekLeft(): T | undefined {
		return this.begin === this.end ? undefined : this.data[this.begin]
	}

	popLeft(): T | undefined {
		if (this.begin === this.end)
			return undefined
		else {
			const value = this.data[this.begin]
			this.data[this.begin] = undefined
			this.begin = (this.begin + 1) % this.data.length
			return value
		}
	}

	get size(): number {
		return this.begin <= this.end
			? this.end - this.begin
			: this.data.length - this.begin + this.end
	}

	* [Symbol.iterator]() {
		if (this.begin <= this.end)
			for (let i = this.begin; i < this.end; i++)
				yield notUndefined(this.data[i])
		else {
			for (let i = this.begin; i < this.data.length; i++)
				yield notUndefined(this.data[i])
			for (let i = 0; i < this.end; i++)
				yield notUndefined(this.data[i])
		}
	}

	filterMutate(cb: (value: T) => boolean): void {
		// For simplicity, just make a new array
		// An in-place algorithm would be more efficient though
		const newData: T[] = []
		for (const x of this)
			if (cb(x))
				newData.push(x)
		this.data = newData
		this.begin = 0
		this.end = this.data.length
	}
}
