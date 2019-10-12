import { ResponseObject } from "@hapi/hapi"
import { start } from "./server"

if (module.parent === null)
	main().catch(console.error)

async function main(): Promise<void> {
	process.on("unhandledRejection", err => {
		console.error(err)
		process.exit(1)
	})

	const server = await start()

	server.events.on("response", rq => {
		const { method, path, payload, response } = rq
		const { source, statusCode } = response as ResponseObject
		console.log(`${method} ${path} --> ${statusCode}`)
		if (payload !== null)
			console.log(`  Request payload: ${JSON.stringify(payload)}`)
		if (source !== null)
			console.log(`  Response payload: ${JSON.stringify(source)}`)
	})

	server.events.on("log", (event, tags) => {
		console.log({ event, tags })
	})
}
