import assert = require("assert")
import { Server, ServerInjectOptions } from "@hapi/hapi"
import {
	NOT_FOUND,
	OK
} from "http-status-codes"

import { TimeGetter } from "../data"
import { init } from "../server"

export function withServer(
	cb: (st: ServerTester) => Promise<void>
): () => Promise<void> {
	return async () => {
		const time = testTimeGetter()
		const server = await init(time)
		await cb(new ServerTester(server, time))
		await server.stop()
	}
}

export class ServerTester {
	server: Server
	constructor(server: Server, readonly time: TestTimeGetter) {
		this.server = server
	}

	async request(options: ServerInjectOptions): Promise<PayloadAndStatusCode> {
		const res = await this.server.inject(options)
		return { payload: res.payload, statusCode: res.statusCode }
	}

	async expect(
		{ payload, statusCode }: PayloadAndStatusCode,
		options: ServerInjectOptions
	): Promise<void> {
		try {
			const expectedPayload =
				typeof payload === "string" ? payload : JSON.stringify(payload)
			assert.deepStrictEqual(await this.request(options), {
				payload: expectedPayload,
				statusCode
			})
		} catch (e) {
			const prefix = `${options.method} ${options.url}\n`
			e.message = `${prefix}${e.message}`
			e.stack = `${prefix}${e.stack}`
			throw e
		}
	}

	expectOK<T>(payload: T, options: ServerInjectOptions): Promise<void> {
		return this.expect({ payload, statusCode: OK }, options)
	}

	expectNotFound<T>(payload: T, options: ServerInjectOptions): Promise<void> {
		return this.expect({ payload, statusCode: NOT_FOUND }, options)
	}
}

interface PayloadAndStatusCode {
	readonly payload: unknown
	readonly statusCode: number
}

interface TestTimeGetter extends TimeGetter {
	increaseTime(milliseconds: number): void
}

function testTimeGetter(): TestTimeGetter {
	let time = 1
	return {
		getTime: () => time,
		increaseTime(milliseconds) {
			time += milliseconds
		}
	}
}
