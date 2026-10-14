# Classes API — issues #26, #27, and #29

`POST /api/classes` accepts a JSON object with exactly these writable fields. All are required. Strings are trimmed before validation and storage; extra fields (including `id` and `_id`) are rejected.

| Field                                               | Accepted value                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| `date`                                              | Real calendar date, `YYYY-MM-DD`                                    |
| `title`, `coach`, `room`, `duration`, `description` | Nonempty string after trimming                                      |
| `category`                                          | `Strength`, `Cardio`, or `Mind & Body`                              |
| `level`                                             | `All levels`, `Beginner`, `Intermediate`, or `Advanced`             |
| `time`, `end`                                       | 24-hour `HH:mm`, `00:00`–`23:59`; end must be later on the same day |
| `spots`                                             | Nonnegative safe integer JSON number, including zero                |

`duration` is a display string (for example `60 minutes`); this endpoint does not derive it from the times. Dates and times use the gym's calendar in America/Los_Angeles.

Example request (use a date in the current gym week to see it in GET):

```json
{
  "date": "2026-10-11",
  "title": "Morning Cardio",
  "category": "Cardio",
  "time": "09:00",
  "end": "10:00",
  "coach": "Alex",
  "room": "Studio 1",
  "level": "Beginner",
  "duration": "60 minutes",
  "spots": 10,
  "description": "A cardio class for beginners."
}
```

- **201:** `{ "success": true, "data": { ...savedFields, "id": "string ObjectId" } }`. Returned only after Mongoose's create resolves. Uses the same public record serializer as GET; no `_id` or `__v` is exposed.
- **400:** `{ "success": false, "message": "Please correct the highlighted fields.", "fieldErrors": { "end": "End time must be after start time on the same day." } }`. `fieldErrors` maps input names to strings. `_form` holds malformed JSON or non-object body errors. Unknown input names also receive errors. Mongoose validation errors use the same shape with safe messages.
- **503:** `{ "success": false, "message": "The class could not be saved right now. Please try again." }`. Connection and write details remain private.

For #29, keep the user's inputs on failure, show known field errors inline and `_form`/`message` above the form, and let the user retry. On 201, show success and reload GET. GET returns `{ success: true, data: { weekLabel, days, classes } }` for the current Monday–Sunday gym week only. A class outside that week remains stored but is absent from this schedule.

## Minimal implementation and tests

Reuse the existing Atlas connection, Mongoose model, repository, and public serializer. Add one input validator, one repository create method, and a POST handler. Validate before connecting; let Mongoose provide an additional guard. Authentication, payments, reservation changes, and the creation UI are outside #27.

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. `tests/api-create-class.test.ts` covers trimmed input, awaiting save confirmation, string IDs, create/read conversion, malformed JSON, missing/invalid/unknown fields without a database call, connection/write failures, and schema guards. Database operations in these tests are mocked; they do not prove Atlas persistence.

## Development Atlas verification

Verified on October 11, 2026, at approximately 3:16 p.m. America/Los_Angeles using the local production build of commit `909c4ec`, configured from the developer's existing `.env.local`. The URI was confirmed to point to MongoDB Atlas; credentials were not printed or copied into Git.

| Real check                              | Result                                                                                  |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| POST with padded title and zero spots   | 201; trimmed saved record, string ID `6acc0aa0ad4224a5700b05fa`; collection count 8 → 9 |
| GET after creation                      | 200; exact saved fields and ID found in current-week schedule                           |
| App stopped and started again           | GET 200; same saved record and ID                                                       |
| Browser `/classes` reload after restart | Demo class remained visible on October 11                                               |
| Nine invalid requests                   | Each returned 400 with the expected field error; count remained 9 after each            |
| Separate app with unreachable database  | Valid POST returned the documented safe 503; Atlas count remained 9                     |

Invalid cases: malformed JSON, blank title, impossible date, unknown category, invalid time, end before start, negative spots, fractional spots, and injected `id`. The saved title is `Atlas verification #27 2026-10-11T22:15:59.668Z`; its description identifies it as a development check, and zero spots prevent reservations. It remains in Atlas as persistence evidence.

### Repeat the check

1. Configure the development `MONGO_URI` securely in `.env.local`, then run `npm run dev`.
2. Submit the example JSON with a current-week date and a unique title to `POST /api/classes` using an HTTP client. Record status 201 and the returned string ID.
3. Call `GET /api/classes`; confirm `data.classes` contains that ID and the trimmed fields. Refresh `/classes`, restart the app, and repeat GET to confirm persistence.
4. Submit malformed JSON, a blank title, an impossible date, end before start, negative/fractional spots, and an unknown field. Confirm 400 with field errors. Confirm the database record count is unchanged for these failed requests.
5. Run a separate local app instance with an unreachable database URI. POST valid JSON; confirm safe 503 with no URI, credentials, or internal details. Restore development configuration and confirm the record count is unchanged.
6. Add the date, development environment, statuses, saved ID, GET/refresh/restart results, and failed-request count checks to the PR. Never include credentials. The saved demo class remains in Atlas; remove it manually only if the team wants cleanup.

A network failure during an in-flight write can have an uncertain outcome: check GET before retrying a submitted class to avoid duplicates. Idempotency is outside this minimal endpoint.

## Staff class management and coaches

The classes page shows creation, editing, and removal controls only for a server-verified gym administrator or an account in `GYM_ADMIN_USER_IDS`. Every mutation repeats authorization on the server and checks the request origin; client visibility never grants access.

`GET /api/coaches` reads MongoDB records with id, name, specialties, bio, and headshot. Class creation/editing resolve coachId against that roster. Public schedules, instructor filters, and profile reservations read the referenced coach name.

`POST /api/classes` creates a class. `PATCH /api/classes/:id` accepts the same complete validated fields. `DELETE /api/classes/:id` archives an unbooked class while retaining its record. Mutations require JSON. Dates/times use America/Los_Angeles; the form calculates duration from start/end times.

Schedules expose spots as remaining availability and capacity as total capacity. Staff edit capacity. It cannot drop below existing reservations. Date/time changes and removal are blocked while reservations exist. Booking and staff changes share a transaction lock, preventing races during removal/capacity edits. Permitted metadata edits update existing reservation snapshots.

Initialize/link the roster with `NODE_ENV=development npm run seed:coaches`. Seed a requested week with `NODE_ENV=development npm run seed:classes -- --week=2026-10-19` (replace the date as needed). Seeding matches date/title and only inserts missing templates, retaining existing IDs, staff edits, and bookings. Reruns do not reset capacity or unarchive removed classes.
