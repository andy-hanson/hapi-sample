import assert = require("assert")
import { Err, Ok, Result } from "@usefultools/monads"
import { Queue } from "./util/queue"
import { flatten, sortBy } from "./util/util"

export interface TimeGetter {
	// Milliseconds since Unix epoch
	getTime(): number
}

export const SECOND = 1000
export const MINUTE = SECOND * 60
export const HOUR = MINUTE * 60
export const DAY = HOUR * 24

export interface UserWithoutName {
	readonly email: string
	readonly password: string
	readonly phone?: string
}

export interface User extends UserWithoutName {
	readonly name: string
}

export interface EventInput {
	readonly type: string
}

export interface Event {
	readonly user: string
	readonly type: string
	// milliseconds since Unix epoch
	readonly created: number
}

export class ServerData {
	private readonly users: Map<string, User> = new Map<string, User>()
	private readonly userToEvents: Map<string, Event[]> =
		new Map<string, Event[]>()
	private readonly eventsToday: EventsToday
	private readonly emails: Set<string> = new Set<string>()

	constructor(private readonly time: TimeGetter) {
		this.eventsToday = new EventsToday(time)
	}

	getAllUsers(): ReadonlyArray<User> {
		return Array.from(this.users.values())
	}

	getUser(name: string): User | undefined {
		return this.users.get(name)
	}

	addUser(user: User): Result<void, string> {
		const { name, email } = user
		if (this.users.has(name))
			return Err(`User ${name} already exists`)
		else if (this.emails.has(email))
			return Err(`User with email ${email} already exists`)
		else {
			this.emails.add(email)
			assert(this.emails.has(email))
			this.users.set(name, user)
			this.userToEvents.set(name, [])
			return Ok(undefined)
		}
	}

	updateUser(name: string, rest: UserWithoutName): Result<void, void> {
		const user = this.users.get(name)
		if (user === undefined)
			return Err(undefined)
		else {
			this.users.set(name, { name, ...rest })
			this.userToEvents.set(name, [])
			return Ok(undefined)
		}
	}

	deleteUser(name: string): Result<void, void> {
		const user = this.users.get(name)
		if (user === undefined)
			return Err(undefined)
		else {
			const deletedUser = this.users.delete(name)
			const deletedEvents = this.userToEvents.delete(name)
			const deletedEmail = this.emails.delete(user.email)
			assert(deletedUser && deletedEvents && deletedEmail)
			this.eventsToday.deleteUser(name)
			return Ok(undefined)
		}
	}

	addEvent(name: string, payload: EventInput): Result<void, void> {
		const events = this.userToEvents.get(name)
		if (events === undefined)
			return Err(undefined)
		else {
			const event: Event = {
				user: name,
				...payload,
				created: this.time.getTime()
			}
			events.push(event)
			this.eventsToday.add(event)
			return Ok(undefined)
		}
	}

	getEventsForUser(user: string): Result<ReadonlyArray<Event>, void> {
		const events = this.userToEvents.get(user)
		return events === undefined ? Err(undefined) : Ok(events)
	}

	getAllEvents(): ReadonlyArray<Event> {
		return sortBy(flatten(this.userToEvents.values()), e => e.created)
	}

	getEventsToday(): ReadonlyArray<Event> {
		return Array.from(this.eventsToday.getAll())
	}
}

class EventsToday {
	private readonly events: Queue<Event> = new Queue<Event>()

	constructor(private readonly time: TimeGetter) {}

	private removeOutdated(): void {
		const dayAgo = this.time.getTime() - DAY
		for (;;) {
			const ev = this.events.peekLeft()
			if (ev === undefined || ev.created > dayAgo)
				break
			this.events.popLeft()
		}
	}

	add(event: Event): void {
		// removeOutdated here isn't necessary,
		// but is better for performance if we add a lot without querying
		this.removeOutdated()
		this.events.pushRight(event)
	}

	getAll(): Iterable<Event> {
		this.removeOutdated()
		return this.events
	}

	deleteUser(name: string): void {
		this.events.filterMutate(e => e.user !== name)
	}
}
