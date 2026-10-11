# Account data and persistence

Supabase authenticates users; it does not automatically send records to MongoDB. Each account API verifies identity using `auth.getUser()` and uses that returned ID as the MongoDB owner. Passwords, sessions, and reset tokens are not stored in MongoDB.

## Storage

- `profiles`: unique `userId`, verified email, first/last name, phone, time format, and default class type. The first authenticated read imports Supabase registration metadata using `$setOnInsert`. Later reads do not overwrite edited fields. Verified email is refreshed from Supabase; email changes still require its confirmation flow.
- `reservations`: unique `(userId, classId, date)` with a server-provided class snapshot. Historical enrollments retain their original details.
- `classoccurrences`: unique `(classId, date)` with capacity and reservation count. Dated capacity keeps legacy recurring class records independent across weeks.
- `demoorders`: unique `(userId, idempotencyKey)`, plan, server-selected simulated amount, and timestamp. No card, billing address, or real payment data is accepted.
- `memberships`: one per user. A demo order can create or update a simulated membership, but cannot overwrite an active manually granted complimentary membership. There are no payments or automatic renewals.

## Authenticated APIs

| Endpoint            | Methods           | Payload                                                                                                 |
| ------------------- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| `/api/profile`      | GET, PUT          | PUT: `firstName`, `lastName`, `phone`                                                                   |
| `/api/preferences`  | GET, PUT          | PUT: `timeFormat` (`12h` or `24h`), `defaultClassCategory` (`All`, `Strength`, `Cardio`, `Mind & Body`) |
| `/api/reservations` | GET, POST, DELETE | POST/DELETE: `classId`, ISO `date`                                                                      |
| `/api/checkout`     | GET, POST         | POST: valid `plan`, UUID v4 `idempotencyKey`; GET returns the latest 20 demo orders                     |
| `/api/membership`   | GET               | Current user's membership                                                                               |

All responses are uncached. Mutation endpoints validate same-origin requests, JSON content, and allowed fields. Client-supplied user IDs, arbitrary prices, membership privileges, and payment details are rejected. Errors distinguish signed-out (401), validation (400), conflicts/full classes (409), and provider/database outages (503), without leaking credentials or internal errors.

Reservations validate a class against the server schedule and reject classes that have started in Los Angeles time. Non-padded and padded class times are compared numerically. MongoDB transactions reserve a seat and insert enrollment together; cancellation removes only the current owner's enrollment and releases its seat in the same transaction. Duplicate reservation and cancellation requests are idempotent. Checkout stores its order and simulated membership in one transaction; a retry key cannot be reused for a different plan.

## Verification

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` for normal checks. Run `ACCOUNT_INTEGRATION_TESTS=1 npx vitest run tests/account-repository.integration.test.ts` with local MongoDB configuration for real persistence and concurrency verification. The connection helper shares in-progress connection attempts, reconnects after disconnection, and limits each pool to ten connections. These opt-in tests use uniquely named disposable collections and clean up only those collections; they do not alter normal account records or expand Atlas permissions.

Browser checks cover profile edit/refresh, invalid phone feedback, preference save/refresh and schedule use, reservation/refresh/cancellation, demo checkout history after refresh, and sign-out/sign-in. Loading, empty, saving/success, and recoverable errors are shown for each account feature. The reservation confirmation renders through a body portal above the navbar.
