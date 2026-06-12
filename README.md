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
- Student onboarding by manual school lookup is scaffolded.
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

Phase 0D public website and program shell is implemented:

- Final landing page with project hero visual.
- Responsive public navbar and footer.
- Article listing, search/filter, and article detail pages.
- About page.
- Detail pages for Bekal 10, Setting Goal, and Smart Financial.
- Student dashboard shell with program progress and portfolio preview.
- Desktop and mobile public route smoke tests.

Phase 1A Bekal 10 core is implemented:

- Real Bekal 10 enrollment, module progress, completion, and sequential unlock APIs.
- Student dashboard and Bekal 10 program dashboard backed by PostgreSQL.
- Modul 1 adaptation and reflection workflow.
- Modul 2 original RIASEC and VARK-style learning preference assessments.
- Database autosave with visible save state and read-only completed modules.
- Reflective assessment result summaries.
- Authenticated UI flows are covered with mocked Playwright API fixtures; production database flow requires deployed seed data.

Bekal 10 API:

- `GET /api/student/programs/bekal-10`
- `GET /api/student/programs/bekal-10/modules/:moduleSlug`
- `PUT /api/student/programs/bekal-10/modules/:moduleSlug`
- `POST /api/student/programs/bekal-10/modules/:moduleSlug/complete`
- `GET /api/student/programs/bekal-10/portfolio`

Phase 1B Bekal 10 complete is implemented:

- Modul 3-7: vision board, SMART development target, journey reflection, academic target, and digital learning commitment.
- Sequential module completion through Modul 7.
- Student portfolio with badges and print/PDF-friendly A4 layout.
- Basic Guru BK dashboard with school metrics, result distributions, search, class filter, and read-only student detail.
- Guru BK attention indicator combines low progress with high adaptation challenges.

Guru BK API:

- `GET /api/teacher/bekal-10/dashboard`
- `GET /api/teacher/bekal-10/students/:userId`

Provision a Guru BK account after the teacher has registered or logged in once:

```bash
npm run teacher:assign -- guru@sekolah.id sma-nusantara "Nama Guru"
```

For Heroku:

```bash
heroku run 'npm run teacher:assign -- guru@sekolah.id sma-nusantara "Nama Guru"' -a highschoolhack-app
```

Phase 1C Admin Sekolah Basic is implemented:

- School overview and manual student onboarding guidance.
- Class create, update, and guarded delete.
- Student profile, NISN, and class management without access to module answers.
- Assign and revoke Guru BK access from registered accounts.
- All admin operations are scoped to the admin's school membership.

Admin API:

- `GET /api/admin/overview`
- `PATCH /api/admin/school`
- `GET|POST /api/admin/classes`
- `PATCH|DELETE /api/admin/classes/:classId`
- `GET /api/admin/students`
- `PATCH /api/admin/students/:userId`
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
