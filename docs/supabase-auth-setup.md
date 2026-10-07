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

## Implementation handoff

Issue: https://github.com/jaydonkc/h4i-calpoly-team7/issues/32

Project creation and local callback configuration are complete. Authentication code and end-to-end sign-in verification remain for the issue owner.

Use the official [Next.js Auth guide](https://supabase.com/docs/guides/auth/quickstarts/nextjs) and [server-side client guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs). This repository uses Next.js 14 App Router: adapt the middleware examples to this installed version rather than copying newer Next.js conventions blindly.

The implementation should add `@supabase/supabase-js` and `@supabase/ssr`, browser/server client helpers, session refresh handling, email/password sign-in, an authenticated profile identity, logout, and server validation for protected content. Implement `/auth/callback` if using email-confirmation or code-exchange redirects. Do not treat a browser-local flag as proof of authentication.

For verification, use a development test account with a confirmed email. Account creation and confirmation are still needed before the real sign-in demo. Registration UI remains a separate issue. The developer must demonstrate invalid credentials, successful sign-in, refresh persistence, logout, and signed-out protection before closing #32.

Supabase is not connected to GitHub automatic schema deployment. Adding URL/key configuration is sufficient for the initial authentication integration; no database migration or GitHub installation is required for this handoff.
