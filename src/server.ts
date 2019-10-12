import assert = require("assert")
import { ResponseToolkit, server, Server } from "@hapi/hapi"
import Joi = require("@hapi/joi")
import { METHOD_NOT_ALLOWED, NOT_FOUND } from "http-status-codes"
import "source-map-support/register"

import {
	Event,
	ServerData,
	TimeGetter,
	User,
	UserWithoutName
} from "./data"

declare module "@hapi/hapi" {
	// eslint-disable-next-line no-shadow
	export function server(options?: ServerOptions): Server
}

const normalString: Joi.StringSchema = Joi.string().min(1).max(100)
const validateUsername: Joi.StringSchema = normalString

const validateNameParams = Joi.object().keys({
	name: validateUsername
})

const validatePhone = Joi.string().regex(/\d\d\d-\d\d\d-\d\d\d\d/).optional()

const validateUserWithoutName = Joi.object().keys({
	email: normalString,
	password: normalString,
	phone: validatePhone
})

const validateUser = Joi.object().keys({
	name: normalString,
	email: normalString,
	password: normalString,
	phone: validatePhone
})

const validateEventPayload = Joi.object().keys({
	type: normalString
})

function assertStrings(o: unknown): object {
	if (typeof o !== "object")
		throw new Error(`Expected an object, got ${o}`)
	for (const v of Object.values(o as object))
		assert(typeof v === "string")
	return o as object
}

function userNotFound(h: ResponseToolkit, name: string) {
	return h.response(`User ${name} not found`).code(NOT_FOUND)
}

function realTimeGetter(): TimeGetter {
	return {
		getTime: () => Date.now()
	}
}

async function getServer(time: TimeGetter): Promise<Server> {
	const srv = server({ port: 3000, host: "localhost" })

	const data = new ServerData(time)

	srv.route({
		method: "GET",
		path: "/users",
		handler: () => data.getAllUsers()
	})

	srv.route({
		method: "GET",
		path: "/users/{name}",
		handler(request, h) {
			const { name } = request.params
			const user = data.getUser(name)
			return user === undefined ? userNotFound(h, name) : user
		},
		options: {
			validate: {
				params: validateNameParams
			}
		}
	})

	srv.route({
		method: "POST",
		path: "/users",
		handler(request, h) {
			const payload = assertStrings(request.payload) as User
			const { name } = payload
			return data.addUser(payload).match({
				ok: () => h.response(`User ${name} created`),
				err: e => h.response(e).code(METHOD_NOT_ALLOWED)
			})
		},
		options: {
			validate: {
				payload: validateUser
			}
		}
	})

	srv.route({
		method: "PUT",
		path: "/users/{name}",
		handler(request, h) {
			const { name } = request.params
			const payload = assertStrings(request.payload) as UserWithoutName
			return data.updateUser(name, payload).match({
				ok: () => h.response(`User ${name} updated`),
				err: () => userNotFound(h, name)
			})
		},
		options: {
			validate: {
				params: validateNameParams,
				payload: validateUserWithoutName
			}
		}
	})

	srv.route({
		method: "DELETE",
		path: "/users/{name}",
		handler(request, h) {
			const { name } = request.params
			return data.deleteUser(name).match({
				ok: () => h.response(`User ${name} deleted`),
				err: () => userNotFound(h, name)
			})
		},
		options: {
			validate: {
				params: validateNameParams
			}
		}
	})

	srv.route({
		method: "POST",
		path: "/users/{name}/events",
		handler(request, h) {
			const { name } = request.params
			const payload = assertStrings(request.payload) as Event
			return data.addEvent(name, payload).match({
				ok: () => h.response("Event added"),
				err: () => userNotFound(h, name)
			})
		},
		options: {
			validate: {
				params: validateNameParams,
				payload: validateEventPayload
			}
		}
	})

	srv.route({
		method: "GET",
		path: "/users/{name}/events",
		handler(request, h) {
			const { name } = request.params
			return data.getEventsForUser(name).match({
				ok: events => h.response(events),
				err: () => userNotFound(h, name)
			})
		},
		options: {
			validate: {
				params: validateNameParams
			}
		}
	})

	srv.route({
		method: "GET",
		path: "/events",
		handler: request => request.query.today
			? data.getEventsToday()
			: data.getAllEvents(),
		options: {
			validate: {
				query: Joi.object().keys({
					today: Joi.bool()
				})
			}
		}
	})

	// For debugging
	srv.route({
		method: "GET",
		path: "/time",
		handler: () => time.getTime()
	})

	return srv
}

export function initRealServer(): Promise<Server> {
	return init(realTimeGetter())
}

export async function init(time: TimeGetter): Promise<Server> {
	const srv = await getServer(time)
	await srv.initialize()
	return srv
}

export async function start(): Promise<Server> {
	const srv = await initRealServer()
	await srv.start()
	console.log(`Server running on ${srv.info.uri}`)
	return srv
}
