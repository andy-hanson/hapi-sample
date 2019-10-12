export function* enumerate<T>(iter: Iterable<T>): Iterable<[number, T]> {
	let i = 0
	for (const x of iter)
		yield [i++, x]
}

export function* flatten<T>(a: Iterable<Iterable<T>>): Iterable<T> {
	for (const xs of a)
		for (const x of xs)
			yield x
}

export function notUndefined<T>(x: T | undefined): T {
	if (x === undefined)
		throw new Error()
	else
		return x
}

export function sortBy<T>(
	a: Iterable<T>,
	cb: (t: T) => number
): ReadonlyArray<T> {
	return Array.from(a).sort((x, y) => cb(x) - cb(y))
}
