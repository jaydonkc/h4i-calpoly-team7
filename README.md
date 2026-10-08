# Fitness Maxxing — Team 7

A gym web application for browsing fitness classes, viewing gym information, exploring memberships, and accessing a member profile.

**Live app:** [h4i-calpoly-team7.vercel.app](https://h4i-calpoly-team7.vercel.app)

**Development preview:** [dev branch deployment](https://h4i-calpoly-team7-git-dev-jaydonkchen-4999s-projects.vercel.app)

## Table of Contents

- [Overview](#overview)
  - [Purpose](#purpose)
  - [Team](#team)
  - [Tech Stack](#tech-stack)
  - [Deployment and Milestone Status](#deployment-and-milestone-status)
- [Getting Started And Contributing](#getting-started-and-contributing)

## Overview

### Purpose

Team 7 is building a gym application that brings class schedules, membership information, gym details, and account access into one responsive website. The current release is a development demo with sample gym content and simulated membership checkout. A confirmed nonprofit partner mission is not established in the repository; this is not yet a partner-approved production release.

### Team

Repository owner: [Jaydon (@jaydonkc)](https://github.com/jaydonkc).

Feature owners listed in the repository's issue tracker:

- [Emi Okumoto (@eokumoto)](https://github.com/eokumoto)
- [Francis Corpuz (@francis-corpuz)](https://github.com/francis-corpuz)
- [Harold Huynh (@HaroldHuynh)](https://github.com/HaroldHuynh)
- [Jacob Lee (@JMLee1231)](https://github.com/JMLee1231)
- [Steven Mossman (@speedisparrow)](https://github.com/speedisparrow)

See the [issue tracker](https://github.com/jaydonkc/h4i-calpoly-team7/issues) for current assignments.

### Tech Stack

- **Application:** Next.js 14 App Router, React 18, TypeScript, and CSS.
- **Database:** MongoDB Atlas and Mongoose; fitness-class persistence integration is in progress.
- **Authentication:** Supabase Auth project configured; application integration is tracked in [#32](https://github.com/jaydonkc/h4i-calpoly-team7/issues/32).
- **Hosting:** Vercel with GitHub deployment integration.
- **Quality checks:** ESLint, Prettier, TypeScript, Vitest, and GitHub Actions.

### Deployment and Milestone Status

Vercel tracks `main` for Production and `dev` for Preview. Both branches have successful deployments. The production dependency conflict was fixed in commit `82af663`, and the primary URL now serves `main`. The gym UI is on the newer `dev` branch; `main` currently contains the earlier starter application. Reviewed feature changes still need to be released to `main`.

Live verification on October 7, 2026:

| Check                   | Result                                             |
| ----------------------- | -------------------------------------------------- |
| Main home page          | HTTP 200                                           |
| Dev classes page        | HTTP 200; sample JSON data                         |
| `GET /api/classes`      | HTTP 404; not implemented on the deployed branches |
| Main `GET /api/example` | HTTP 200; Atlas connection confirmed               |

**Milestone 2's live CRUD verification is pending.** The minimum planned operations are reading classes ([#26](https://github.com/jaydonkc/h4i-calpoly-team7/issues/26)) and creating classes ([#27](https://github.com/jaydonkc/h4i-calpoly-team7/issues/27)). Frontend integration and a validated creation form are tracked in [#28](https://github.com/jaydonkc/h4i-calpoly-team7/issues/28) and [#29](https://github.com/jaydonkc/h4i-calpoly-team7/issues/29). The acceptance demo must create a class on the deployed app, read it back, and confirm it remains after refresh; loading sample data alone does not satisfy this check.

See [Vercel deployment notes](docs/vercel-deployment.md) and [Supabase setup](docs/supabase-auth-setup.md) for configuration and limitations.

## Getting Started And Contributing

Use Node.js 22 and npm. Clone the repository and start from the development branch:

```sh
git clone https://github.com/jaydonkc/h4i-calpoly-team7.git
cd h4i-calpoly-team7
git switch dev
npm ci
cp .env.local.example .env.local
```

If `.env.local` already exists, preserve it and add only missing variables.

| Variable                               | Purpose                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| `MONGO_URI`                            | Server-only Atlas connection string. Obtain it securely from the project owner. |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL; included in the example file.                             |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase public client key; included in the example file.                       |

Replace the Atlas password placeholder before using database routes. Keep `.env.local`, database passwords, and Supabase secret/service-role keys out of Git. On Vercel, save variables in **Project Settings → Environment Variables**, select the appropriate Production/Preview environment, and redeploy after changes. Do not hardcode database credentials in application source.

```sh
npm run dev
```

Open [localhost:3000](http://localhost:3000). Before requesting review, run:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Follow [getting-started.md](docs/getting-started.md) for setup details and [contributing.md](docs/contributing.md) for the branch and pull-request workflow. Changes should be reviewed on `dev` before release to `main`.
