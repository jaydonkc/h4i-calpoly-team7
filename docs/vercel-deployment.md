# Team7 Vercel deployment

Configured October 7, 2026 on the existing Hobby account.

- Project dashboard: https://vercel.com/jaydonkchen-4999s-projects/h4i-calpoly-team7
- Connected repository: `jaydonkc/h4i-calpoly-team7`
- Framework: Next.js; root directory: `./`; standard detected install/build commands.
- Production branch tracking: `main`.
- Primary URL: https://h4i-calpoly-team7.vercel.app
- Stable dev preview URL: https://h4i-calpoly-team7-git-dev-jaydonkchen-4999s-projects.vercel.app
- Pushes to `main` create production deployments. Pushes to `dev` create preview deployments and update its branch URL. Other branches may also receive previews.

## Verified status

The initial import deployed `dev` commit `efae329` successfully to the primary URL. A separate Preview deployment of the same commit succeeded, and its stable dev URL loads the app.

The first `main` deployment of `c1ba82e` failed during `npm install`: `@types/node` 20 conflicted with Vitest 5. Commit `82af663` upgrades the Node types and lockfile to 22.20.5. The isolated fix passed the production build and both existing tests, and the main Vercel deployment is now Ready. The primary URL serves the earlier starter app from main; the newer gym UI remains on dev. No feature branches were merged as part of setup.

A live request to the main `/api/example` endpoint returned HTTP 200 with the expected greeting after the deployment. That verifies a database connection, not fitness-class CRUD.

## Environment configuration

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are configured for Production and Preview. See `supabase-auth-setup.md` for values and the exact saved callback URLs. The application still needs the auth implementation in issue #32.

Both Vercel environments currently use the same development Supabase project, so authentication users/data are shared. Separate deployments do not imply separate databases.

`MONGO_URI` is saved as a Secret in both Production and Preview with the owner's approval. Database credentials are not included in this document. Current dev class UI still uses sample JSON; MongoDB-backed API work needs live CRUD verification. Never put database credentials in a `NEXT_PUBLIC_` variable.

Local uncommitted UI changes were not included in these GitHub-based deployments. Setup documentation is published separately to dev. No paid plan, custom domain, or new team permissions were added.
