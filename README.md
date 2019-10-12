# Running

To build, lint, and tests: `npm all`
To run the server: `npm start`


# Implementation notes

Everything HTTP-related is in `server.ts`.
Everything data-related is in `data.ts`.
Generic, non-application-specific code is in `util`.
(I looked for a queue library, but didn't find one that was iterable.)
`index.ts` just contains the main function.

Tests are in `test`.
The server tests use hapi instead of the real server.
See `Black box testing` below.


# Things done

* Create, read, update, delete users
* Create events
* Query events by user, all events, or all events today
* Basic input validation
* Unit tests


# Things not done

* No security. Anyone can make any request.
  We will even gladly return the password of any user if you ask for it.
* No persistence. Data is stored in ordinary data structures in memory.
* Events have no identifier, so no way to delete or update them.
* BAD_REQUEST errors could tell you precicely what was wrong (e.g. phone number format is wrong)

# Black box testing

See `blackBoxTest.sh`.
This won't run automatically as it must be verified manually.
See the instructions inside.


