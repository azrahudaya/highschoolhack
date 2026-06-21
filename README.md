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
npm run typecheck
npm run lint
npm run audit:prod
npm start
npm run test:e2e
npm run test:e2e:permissions
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

Current MVP is implemented across the public site, student programs, Guru BK dashboard, and school admin area.

Student programs:

- Bekal 10: adaptation, RIASEC/VARK-style assessment, vision board, SMART target, reflection, academic target, learning commitment, and portfolio.
- Setting Goal: class XI exploration, four macro targets, P1-P4 action-plan calendar, progress dashboard, and portfolio.
- Smart Financial: class XII profile, destination city cost simulation, Future Ready Board stepper, emergency cards, scholarship portal, final recommendation, and downloadable Future Ready Board PDF.

Operational features:

- Session auth with email/password, optional Google OAuth, email verification, password reset, and rate limiting on sensitive auth endpoints.
- Multi-school data scoping for student, teacher, and admin roles.
- Admin school overview, class management, student profile management, bulk import, Guru BK assignment, and audit log.
- Guru BK dashboard with school metrics, student search/filter, portfolio detail, notes, and CSV export.

Important verification:

- `npm run build` checks Prisma generation, client build, and server TypeScript build.
- `npm run audit:prod` checks production dependency vulnerabilities.
- `npm run test:e2e` runs mocked UI/API flow tests on desktop and mobile.
- `npm run test:e2e:permissions` runs cross-school permission tests. The command fails fast when `DATABASE_URL` is missing, then reads `.env` via `dotenv/config` for the test run.

Provision a Guru BK account after the teacher has registered or logged in once:

```bash
npm run teacher:assign -- guru@sekolah.id sma-nusantara "Nama Guru"
```

For Heroku:

```bash
heroku run 'npm run teacher:assign -- guru@sekolah.id sma-nusantara "Nama Guru"' -a highschoolhack-app
```

Admin API:

- `GET /api/admin/overview`
- `PATCH /api/admin/school`
- `GET|POST /api/admin/classes`
- `PATCH|DELETE /api/admin/classes/:classId`
- `GET /api/admin/students`
- `PATCH /api/admin/students/:userId`
- `POST /api/admin/students/bulk-import`
- `GET|POST /api/admin/teachers`
- `DELETE /api/admin/teachers/:userId`

Provision an Admin Sekolah account after the admin has registered or logged in once:

```bash
npm run admin:assign -- admin@sekolah.id sma-nusantara "Nama Admin"
```

For Heroku:

```bash
heroku run 'npm run admin:assign -- admin@sekolah.id sma-nusantara "Nama Admin"' -a highschoolhack-app
```
