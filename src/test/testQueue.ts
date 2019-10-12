import assert = require("assert")
import Lab = require("@hapi/lab")

import { Queue } from "../util/queue"

export const lab = Lab.script()
const { describe, it } = lab

describe("Queue", () => {
	it("works", () => {
		const q = new Queue<number>()
		q.pushRight(1)
		q.pushRight(2)
		assert.deepStrictEqual(Array.from(q), [1, 2])
		assert.equal(q.popLeft(), 1)
		assert.deepStrictEqual(Array.from(q), [2])
		assert.equal(q.popLeft(), 2)
		assert.deepStrictEqual(Array.from(q), [])
		assert.equal(q.popLeft(), null)
		for (const x of [3, 4, 5, 6])
			q.pushRight(x)
		assert.deepStrictEqual(Array.from(q), [3, 4, 5, 6])
		q.filterMutate(x => x % 2 === 0)
		assert.deepStrictEqual(Array.from(q), [4, 6])
	})
})
