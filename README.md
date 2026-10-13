# Fitness Maxxing — Team 7

Fitness Maxxing is a fictional gym with an intentionally playful identity. Coach accolades and street addresses are part of the story. The application stores accounts, class reservations, membership selections, and contact messages in MongoDB; checkout is simulated and never charges money.

## What the app does

- Supabase signup, email confirmation, login, logout, password recovery, and server-protected account pages.
- MongoDB profiles and preferences, class reservations with transactional capacity checks, and idempotent simulated membership checkout.
- Server-rendered class schedules streamed behind a loading shell; client filters, location selection, and booking refreshes.
- Administrator class creation at `/classes/new`, with input validation and a MongoDB-backed schedule.
- Signed-in contact messages saved to the gym inbox at `/admin/messages`. No email, SMS, or external messaging service is used.
- Finished fictional coach bios, four locations, opening hours, membership descriptions, and FAQs.

## Local setup

Use Node.js 22 and npm:

```sh
npm ci
cp .env.local.example .env.local
npm run dev
```

Preserve an existing `.env.local`. Fill in `MONGO_URI` with the Atlas application credential; keep all credentials out of Git. The Supabase URL and publishable key are public client configuration.

Administrator access requires a server-only `GYM_ADMIN_USER_IDS` list of Supabase user UUIDs, or an `admin` role in trusted Supabase `app_metadata`. Member-editable `user_metadata` never grants access. An empty list grants nobody access unless they have the trusted role. Apply the same configuration in Vercel when releasing.

## Class data

The schedule always reads MongoDB. The curated lineup in `src/data/classes.json` is used by the explicit weekly publishing command, never as a fallback when the database fails.

```sh
NODE_ENV=development npm run seed:classes
NODE_ENV=development npx tsx scripts/refresh-class-content.ts
```

The weekly publisher creates eight classes per day with stable IDs tied to each date. Re-running it updates those entries; past weeks retain their IDs. The content refresh normalizes existing curated classes and locations while preserving dates, IDs, capacity, and reservations. Neither command deletes custom classes.

## Membership rules

All plans have the same location and group-class access in this fictional app. Student, Standard, and Premium are story choices with different displayed prices. No card is requested and no payment is processed. A simulated membership lasts one month with no recurring billing; selecting another plan starts a new simulated period. Separately granted complimentary memberships are preserved.

## Verification and release

```sh
npm run lint
npm run typecheck
npm test
ACCOUNT_INTEGRATION_TESTS=1 npx vitest run tests/account-repository.integration.test.ts
npm run build
```

The integration suite uses isolated MongoDB collections and removes its test collections afterward. It tests profile/preferences persistence, reservations and capacity, cancellation, and checkout transactions. Run only against the development database.

Feature PRs target `dev`. Production tracks `main`. Before release, verify the deployed signup/confirmation flow, login returns, booking/refresh/cancellation, simulated checkout persistence, signed-out protection, administrator class creation, and contact inbox. A build or deployment success does not establish those user flows.

See [contributing](docs/contributing.md) and [release checklist](docs/release-checklist.md). Development preview: [Vercel dev app](https://h4i-calpoly-team7-git-dev-jaydonkchen-4999s-projects.vercel.app).
