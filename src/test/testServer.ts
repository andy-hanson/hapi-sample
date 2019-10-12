import Lab = require("@hapi/lab")
import { BAD_REQUEST, METHOD_NOT_ALLOWED } from "http-status-codes"

import { DAY, Event, User, UserWithoutName } from "../data"
import { withServer as withTestServer } from "./serverTester"

export const lab = Lab.script()
const { describe, it } = lab

describe("API", () => {
	it("users", withTestServer(async s => {
		const userWithoutName: UserWithoutName = {
			email: "andy-hanson@protonmail.com",
			password: "p@ssword",
			phone: "703-402-2284"
		}
		const user: User = { name: "andy", ...userWithoutName }

		function expectAndyNotFound(): Promise<void> {
			return s.expectNotFound("User andy not found", {
				method: "GET",
				url: "/users/andy"
			})
		}

		await expectAndyNotFound()

		// violate phone number syntax
		await s.expect(
			{
				payload: {
					statusCode: BAD_REQUEST,
					error: "Bad Request",
					message: "Invalid request payload input"
				},
				statusCode: BAD_REQUEST
			},
			{
				method: "POST",
				url: "/users",
				payload: {
					...user,
					phone: "not a phone number"
				}
			}
		)

		await expectAndyNotFound()

		await s.expectOK("User andy created", {
			method: "POST",
			url: "/users",
			payload: user
		})

		await s.expect(
			{
				payload:
					"User with email andy-hanson@protonmail.com already exists",
				statusCode: METHOD_NOT_ALLOWED
			},
			{
				method: "POST",
				url: "/users",
				payload: {
					name: "randy",
					email: user.email,
					password: "randyspass"
				}
			}
		)

		await s.expect(
			{
				payload: "User andy already exists",
				statusCode: METHOD_NOT_ALLOWED
			},
			{
				method: "POST",
				url: "/users",
				payload: user
			}
		)

		await s.expectOK(user, {
			method: "GET",
			url: "/users/andy"
		})

		await s.expectOK([user], { method: "GET", url: "/users" })

		const newUserWithoutName: UserWithoutName = {
			...userWithoutName,
			password: "Runner4567"
		}

		await s.expectOK("User andy updated", {
			method: "PUT",
			url: "/users/andy",
			payload: newUserWithoutName
		})

		await s.expectNotFound("User duley not found", {
			method: "PUT",
			url: "/users/duley",
			payload: { password: "123456" }
		})

		await s.expectOK(
			{ name: "andy", ...newUserWithoutName },
			{
				method: "GET",
				url: "/users/andy"
			}
		)

		await s.expectOK("User andy deleted", {
			method: "DELETE",
			url: "/users/andy"
		})

		await expectAndyNotFound()
	}))

	it("events", withTestServer(async s => {
		function assertTime(time: number): Promise<void> {
			return s.expectOK(time, { method: "GET", url: "/time" })
		}
		function addEvent(user: string, type: string): Promise<void> {
			return s.expectOK("Event added", {
				method: "POST",
				url: `/users/${user}/events`,
				payload: {
					type
				}
			})
		}

		await assertTime(1)

		const users = ["alice", "bob"]
		for (const user of users)
			await s.expectOK(`User ${user} created`, {
				method: "POST",
				url: "/users",
				payload: {
					name: user,
					email: `${user}@protonmail.com`,
					password: `${user}spass`
				}
			})

		await assertTime(1)

		await s.expectNotFound("User carol not found", {
			method: "POST",
			url: "/users/carol/events",
			payload: { type: "LOGIN" }
		})

		// No empty type
		await s.expect(
			{
				payload: {
					statusCode: BAD_REQUEST,
					error: "Bad Request",
					message: "Invalid request payload input"
				},
				statusCode: BAD_REQUEST
			},
			{
				method: "POST",
				url: "/users/carol/events",
				payload: { type: "" }
			}
		)

		await addEvent("alice", "LOGIN")

		s.time.increaseTime(1)

		await addEvent("bob", "LOGIN")

		await s.expectOK<ReadonlyArray<Event>>(
			[{ user: "alice", type: "LOGIN", created: 1 }],
			{
				method: "GET",
				url: "/users/alice/events"
			}
		)
		await s.expectNotFound("User carol not found", {
			method: "GET",
			url: "/users/carol/events"
		})

		const event1: Event = { user: "alice", type: "LOGIN", created: 1 }
		const event2: Event = { user: "bob", type: "LOGIN", created: 2 }

		const events1And2: ReadonlyArray<Event> = [event1, event2]

		await s.expectOK<ReadonlyArray<Event>>(events1And2, {
			method: "GET",
			url: "/events"
		})

		function expectToday(events: ReadonlyArray<Event>): Promise<void> {
			return s.expectOK(events, {
				method: "GET",
				url: "/events?today=true"
			})
		}

		await expectToday(events1And2)

		s.time.increaseTime(DAY / 2)

		await addEvent("alice", "LOGOUT")
		s.time.increaseTime(1)
		await addEvent("bob", "LOGOUT")

		const event3: Event = {
			user: "alice",
			type: "LOGOUT",
			created: DAY / 2 + 2
		}
		const event4: Event = {
			user: "bob",
			type: "LOGOUT",
			created: DAY / 2 + 3
		}

		const allEvents: ReadonlyArray<Event> = [...events1And2, event3, event4]

		await expectToday(allEvents)

		s.time.increaseTime(DAY / 2)

		await expectToday([event3, event4])

		await s.expectOK(allEvents, { method: "GET", url: "/events" })
		await s.expectOK(allEvents, {
			method: "GET",
			url: "/events?today=false"
		})

		// Deleting a user deletes their events
		await s.expectOK("User alice deleted", {
			method: "DELETE",
			url: "/users/alice"
		})

		await s.expectOK([event2, event4], { method: "GET", url: "/events" })
		await s.expectOK([event4], { method: "GET", url: "/events?today=true" })
	}))
})
