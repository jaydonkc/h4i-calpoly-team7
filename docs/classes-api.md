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

## Development Atlas check — pending

No development Atlas credentials were provided for this change. Do not close #27 until real create/read and persistence evidence is added to its PR.

1. Configure the development `MONGO_URI` securely in `.env.local`, then run `npm run dev`.
2. Submit the example JSON with a current-week date and a unique title to `POST /api/classes` using an HTTP client. Record status 201 and the returned string ID.
3. Call `GET /api/classes`; confirm `data.classes` contains that ID and the trimmed fields. Refresh `/classes`, restart the app, and repeat GET to confirm persistence.
4. Submit malformed JSON, a blank title, an impossible date, end before start, negative/fractional spots, and an unknown field. Confirm 400 with field errors. Confirm the database record count is unchanged for these failed requests.
5. Run a separate local app instance with an unreachable database URI. POST valid JSON; confirm safe 503 with no URI, credentials, or internal details. Restore development configuration and confirm the record count is unchanged.
6. Add the date, development environment, statuses, saved ID, GET/refresh/restart results, and failed-request count checks to the PR. Never include credentials. The saved demo class remains in Atlas; remove it manually only if the team wants cleanup.

A network failure during an in-flight write can have an uncertain outcome: check GET before retrying a submitted class to avoid duplicates. Idempotency is outside this minimal endpoint.
