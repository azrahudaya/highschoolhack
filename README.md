# HighschoolHack

Platform pengembangan diri dan perencanaan masa depan untuk siswa SMA Indonesia.

## Stack

- React + Vite + TypeScript
- Express.js + TypeScript
- Prisma ORM
- Heroku Postgres
- Tailwind CSS

## Struktur

- `client/`: React frontend.
- `server/`: Express API dan static server untuk hasil build React.
- `prisma/`: schema database.
- `highschoolhack-prd.md`: PRD produk.
- `highschoolhack-technical-plan.md`: rencana teknis dan fase implementasi.

## Scripts

```bash
npm install
npm run dev
npm run build
npm start
npm run test:e2e
```

## Local URLs

- React dev server: `http://localhost:5173`
- Express production-style server: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

## Environment

Copy `.env.example` to `.env`, then fill the values:

```bash
DATABASE_URL=
SESSION_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
CLIENT_URL=
```

## Current Phase

Phase 0A is complete:

- npm workspaces are configured.
- React/Vite client is configured.
- Express/TypeScript server is configured.
- Prisma schema baseline is available.
- Heroku `Procfile` and root build/start scripts are available.
- Express can serve the React production build.

Phase 0B foundation is scaffolded:

- Multi-school schema has `schools`, `classes`, `school_memberships`, and school-scoped student profiles.
- School list and class list API routes are scaffolded.
- Student onboarding by school join code is scaffolded.
- Seed script is available at `npm run db:seed`.

Phase 0C auth foundation is scaffolded:

- Email/password registration and login with hashed passwords.
- Conditional Google OAuth through Passport.js.
- PostgreSQL-backed sessions when `DATABASE_URL` is configured.
- Development-only memory session fallback when no database is configured.
- Protected student, teacher, and admin API routes.
- Real session-based student onboarding.
- React login, register, onboarding, and protected portal shells.

Auth API:

- `GET /api/auth/me`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/protected/student`
- `GET /api/protected/teacher`
- `GET /api/protected/admin`

Pending runtime validation:

- Set a real `DATABASE_URL`.
- Create and deploy the initial Prisma migration.
- Run seed data.
- Configure Google OAuth credentials.
