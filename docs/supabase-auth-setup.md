# Supabase Auth development setup

The Team7 development project was created on October 7, 2026. Supabase supplies authentication; the existing Atlas database continues to store fitness classes.

## Project

- Name: `h4i-team7-dev`
- Owner organization: `jaydonkc's Org` (Free)
- Dashboard: https://supabase.com/dashboard/project/agtbwagdlchowvnxilnn
- Project URL: `https://agtbwagdlchowvnxilnn.supabase.co`
- Region: East US (Ohio), `us-east-2`
- Email authentication is enabled; new users must confirm their email before first sign-in. Anonymous sign-in is disabled.
- Site URL: `https://h4i-calpoly-team7.vercel.app`
- Allowed callbacks: `http://localhost:3000/auth/callback`, `https://h4i-calpoly-team7.vercel.app/auth/callback`, and `https://h4i-calpoly-team7-git-dev-jaydonkchen-4999s-projects.vercel.app/auth/callback`.
- Local and dev-preview flows must explicitly request their own callback URL; the default is the primary deployed site.

## Teammate configuration

If `.env.local` does not exist, copy `.env.local.example` to `.env.local`. If it already exists, add only the following entries, preserving your existing MongoDB configuration:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://agtbwagdlchowvnxilnn.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_wHqRCJivcdddHh8MLKLSIg_GwwVcruc
```

The publishable key is intended for application clients and is safe to include in this setup example. It does not grant dashboard administration. Database passwords, Supabase secret/service-role keys, and MongoDB credentials must remain private. `.env.local` is ignored by Git.

Restart `npm run dev` after changing environment variables. Teammates can use the application configuration without sharing the owner's Supabase account. Dashboard access is a separate invitation/permission decision.

## Implemented flows

The application uses `@supabase/ssr` and `@supabase/supabase-js` for cookie-based authentication in Next.js 14. `src/middleware.ts` verifies and refreshes sessions; server handlers independently use `getUser()` before returning protected identity data.

- `/profile`: email/password login, registration, confirmation resend, password recovery, logout, and editing MongoDB-backed profile details.
- `/auth/callback`: exchanges the PKCE code, applies a validated local return destination, and shows a recoverable error for invalid/expired links.
- `/auth/reset-password`: requires a verified authenticated session before rendering the new-password form.
- `/api/auth/user`: returns the verified user's ID/email or 401; provider unavailability returns 503. Responses are not cached.

Email links must be opened in the same browser where the request started, because PKCE uses a browser-specific verifier. A short-lived navigation cookie remembers the destination so email requests use the exact configured callback URL. Registration requires email confirmation unless the provider is configured otherwise. Email address changes use Supabase's confirmation flow.

Supabase owns authentication, email confirmation, and password recovery. MongoDB owns profiles, preferences, reservations, demo orders, and memberships, linked by the verified Supabase user ID. The first authenticated profile read imports registration metadata if a MongoDB profile does not exist; later edits save only to MongoDB. Confirmed email changes are reflected on the next profile read. These systems do not synchronize automatically. Names and phone numbers never determine staff privileges. See [Account data](account-data.md) for API contracts and verification.

No service-role key is needed. Keep email confirmation enabled. If the built-in email sender rejects a recipient or is rate limited, configure a suitable SMTP provider through a separate provider setup; do not bypass confirmation to make a test pass.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. Tests cover callback failure, redirect sanitization, and signed-out/invalid-token rejection at the protected identity endpoint.

For the live test, run on `http://localhost:3000`, which is already allowed by the project. Register using a development test email, confirm in the same browser, and check successful login, invalid credentials, refresh persistence, profile updates, logout, and signed-out rejection by `/api/auth/user`. Request a password reset and complete the reset page using a new password. Actual email delivery and signed-in flows require a confirmed test account; automated mock tests alone do not verify them.

Issue: https://github.com/jaydonkc/h4i-calpoly-team7/issues/32

References: [Supabase SSR client guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs), [password recovery API](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail).

## Login and account access

`/login` hosts the public login, registration, and recovery forms. `/profile` verifies the cookie session with Supabase on the server before rendering account controls. Signed-out requests are redirected to login with a validated internal return path; authentication outages show a retry state. Account APIs independently verify identity and return 401 for signed-out requests or 503 for provider outages.

The browser client persists the session in cookies and listens for authentication changes; middleware refreshes those cookies across pages. Log Out ends the current browser session with Supabase's local sign-out scope and clears all account state. Class login links preserve the class date and selection and focus its Reserve action after login. Membership login links restore the selected plan's confirmation dialog. Returning after login does not automatically book a class or complete checkout.
