# Technical Plan HighschoolHack

Tanggal: 2026-06-11
Deployment target: Heroku
Database utama: Heroku Postgres
Scope produk: multi-sekolah, kelas X-XII, dibangun bertahap
Stack final Phase 0A: React + Express + Prisma + Heroku Postgres

## 1. Stack yang Disarankan

### Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- Recharts
- Framer Motion seperlunya
- React Router
- React Hook Form
- Zod

### Backend

- Express.js
- TypeScript
- Prisma ORM
- Heroku Postgres
- Zod untuk request validation
- Passport.js untuk OAuth Google dan email/password
- express-session
- connect-pg-simple untuk session store PostgreSQL
- Helmet, CORS, Morgan, Compression

### Testing dan quality

- Vitest untuk unit test
- Playwright untuk end-to-end test
- ESLint
- Prettier
- TypeScript strict mode

### PDF dan report

- Fase awal: print-friendly CSS dari browser
- Fase lanjutan: React PDF atau server-side PDF generator
- Export Excel ditunda sampai dashboard stabil

## 2. Arsitektur Produk

Gunakan satu repository dengan dua aplikasi utama:

- `client`: React/Vite untuk UI.
- `server`: Express API untuk auth, role, data, dan business logic.
- `prisma`: schema dan migration database.

Untuk deployment Heroku, tetap gunakan satu Heroku app:

1. Heroku menjalankan build client.
2. Heroku menjalankan build server.
3. Express menjalankan API.
4. Express serve hasil build React dari `client/dist`.

Pembagian area aplikasi:

- Public site: landing page, artikel, tentang kami.
- Student app: program siswa, modul, asesmen, portofolio.
- Teacher dashboard: monitoring siswa, detail portofolio, statistik.
- School admin: kelola kelas, guru, siswa.
- Super admin: kelola sekolah dan konfigurasi global.

## 3. Multi-Sekolah

Multi-sekolah harus dirancang sejak awal agar data tidak tercampur.

Prinsip:

- Setiap siswa, guru, kelas, enrollment, progress, dan response memiliki `schoolId`.
- Semua query dashboard wajib difilter berdasarkan `schoolId`.
- Guru BK hanya bisa melihat siswa dari sekolahnya.
- Jika nanti satu guru mengelola beberapa sekolah, gunakan tabel membership.

Role awal:

- `student`
- `teacher_bk`
- `school_admin`
- `super_admin`

Join sekolah:

- Siswa login dengan Google/email.
- Setelah login pertama, siswa mengisi profil dan memasukkan kode sekolah.
- Untuk MVP, gunakan kode sekolah agar onboarding lebih mudah.
- Guru BK dan admin dibuat melalui invite atau super admin.

## 4. Auth Flow

### Login Google/Gmail

1. User klik login dengan Google di React.
2. Browser diarahkan ke endpoint Express `/api/auth/google`.
3. Passport.js mengarahkan user ke Google OAuth.
4. Setelah callback, server membuat atau menemukan user.
5. Jika user belum punya profil atau membership sekolah, arahkan ke onboarding.

### Login email/password

1. User registrasi dengan email dan password.
2. Password disimpan dalam bentuk hash.
3. User login melalui endpoint `/api/auth/login`.
4. Express membuat session cookie.
5. Jika user belum punya profil atau membership sekolah, arahkan ke onboarding.

Catatan:

- Password reset butuh transactional email provider. Jika belum siap, password reset bisa ditunda, tetapi harus masuk roadmap sebelum production sekolah besar.
- Jangan hardcode akun Guru BK seperti `bkadmin/bk123` di production.
- Cookie session harus `httpOnly`.
- Gunakan `secure` cookie saat production HTTPS.

## 5. Database Model Awal

Tabel auth:

- `users`
- `auth_accounts`
- `sessions`

Tabel tenant:

- `schools`
- `school_memberships`
- `classes`

Tabel profil:

- `student_profiles`
- `teacher_profiles`

Tabel program:

- `programs`
- `program_modules`
- `program_enrollments`
- `module_progress`
- `module_responses`
- `assessment_results`
- `portfolios`

Tabel konten:

- `articles`
- `study_programs`
- `careers`
- `scholarships`
- `city_costs`

Tabel audit:

- `audit_logs`

## 6. Module Engine

Gunakan pendekatan hybrid.

Untuk modul sederhana:

- Definisi pertanyaan bisa disimpan sebagai config JSON.
- Tipe field: text, textarea, radio, checkbox, scale, select, date, number.
- Response disimpan sebagai JSON di `module_responses`.

Untuk modul kompleks:

- Buat React component khusus.
- Contoh: RIASEC, VARK, calendar action plan, board-game simulation, financial score.

Keuntungan:

- Kelas X, XI, XII bisa memakai sistem progress yang sama.
- Form sederhana tidak perlu hardcode semua.
- Modul kompleks tetap bisa dibuat rapi dan interaktif.

## 7. Route Structure

### React routes

Public:

- `/`
- `/articles`
- `/articles/:slug`
- `/about`
- `/programs/bekal-10`
- `/programs/setting-goal`
- `/programs/smart-financial`

Auth:

- `/login`
- `/register`
- `/onboarding`

Student:

- `/app`
- `/app/programs`
- `/app/programs/:programSlug`
- `/app/programs/:programSlug/modules/:moduleSlug`
- `/app/portfolio`
- `/app/profile`

Teacher:

- `/teacher`
- `/teacher/students`
- `/teacher/students/:studentId`
- `/teacher/reports`

Admin:

- `/admin`
- `/admin/schools`
- `/admin/classes`
- `/admin/users`

### Express API routes

- `GET /api/health`
- `GET /api/auth/me`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/schools`
- `POST /api/onboarding/student`
- `GET /api/programs`
- `GET /api/programs/:programSlug`
- `GET /api/modules/:moduleId/response`
- `PUT /api/modules/:moduleId/response`
- `GET /api/teacher/students`
- `GET /api/teacher/students/:studentId`

## 8. Heroku Setup

Requirement:

- `package.json` di root project.
- npm workspaces untuk `client` dan `server`.
- `build` script yang build client dan server.
- `start` script yang menjalankan Express.
- Heroku Postgres add-on.
- Config vars untuk secret.

Config vars minimum:

- `DATABASE_URL`
- `SESSION_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `CLIENT_URL`
- `NODE_ENV`

Build flow:

1. Heroku install dependencies.
2. Heroku menjalankan `npm run build`.
3. Prisma generate dijalankan saat build.
4. Migration dijalankan secara terkontrol, bukan sembarang otomatis di setiap boot.
5. Heroku menjalankan `npm start`.
6. Express serve API dan React static assets.

## 9. RIASEC dan VARK

RIASEC:

- Gunakan O*NET Interest Profiler sebagai referensi struktur.
- Untuk MVP, buat item berbahasa Indonesia dengan wording original.
- Kategori: Realistic, Investigative, Artistic, Social, Enterprising, Conventional.

VARK:

- Gunakan VARK sebagai referensi konsep Visual, Aural, Read/write, Kinesthetic.
- Jangan menyalin item resmi VARK tanpa izin.
- Untuk MVP, buat inventori preferensi belajar original yang mirip tujuan eksplorasinya, bukan salinan questionnaire resmi.

Disclaimer:

- Tampilkan bahwa asesmen adalah alat refleksi dan eksplorasi diri.
- Jangan klaim sebagai diagnosis psikologis.

## 10. Fase Setelah PRD

### Phase 0A: Project Setup

Output:

- Scaffold npm workspaces.
- Setup React/Vite client.
- Setup Express/TypeScript server.
- Setup Tailwind.
- Setup Prisma.
- Setup baseline Heroku scripts.
- Setup environment example.
- Setup health API.
- Setup baseline landing page.

### Phase 0B: Multi-School Foundation

Output:

- Schema schools, users, memberships, classes.
- Role guard.
- Onboarding user.
- Kode sekolah.
- Seed super admin dan sekolah demo.

Status:

- Schema foundation, onboarding route, school routes, and seed script are scaffolded.
- Runtime DB testing is pending until `DATABASE_URL` is available.

### Phase 0C: Auth Foundation

Output:

- Google OAuth.
- Email/password register and login.
- Session persistence di PostgreSQL.
- Protected API routes.
- Protected React routes.

Status:

- Passport local credentials, conditional Google OAuth, session middleware, role guards, and React auth screens are implemented.
- Full runtime validation is pending until Heroku Postgres and Google OAuth credentials are connected.

### Phase 0D: Public Website and Program Shell

Output:

- Landing page final.
- Artikel statis.
- Tentang Kami.
- Halaman program Bekal 10, Setting Goal, Smart Financial.
- CTA login.

### Phase 1A: Bekal 10 Core

Output:

- Student dashboard.
- Modul 1 dan Modul 2.
- RIASEC/VARK versi MVP.
- Progress tracker.
- Autosave.

### Phase 1B: Bekal 10 Complete

Output:

- Modul 3-7.
- Portofolio siswa.
- Print portfolio.
- Dashboard Guru BK basic.

### Phase 2: Setting Goal

Output:

- Modul kelas XI.
- Database program studi dan karier.
- SMART goals.
- Action plan calendar.

### Phase 3: Smart Financial

Output:

- Simulasi finansial.
- City cost database awal.
- Financial readiness score.
- Beasiswa.
- Early warning dashboard.

## 11. Keputusan Fase Berikutnya

Fase berikutnya adalah Phase 0A: Project Setup dengan React + Express.

Deliverable pertama adalah fondasi aplikasi yang bisa dijalankan lokal dan siap untuk Heroku:

- React app berjalan.
- Express API berjalan.
- Express bisa serve React build.
- Prisma schema awal tersedia.
- Heroku scripts tersedia.
- Health check API tersedia.

Setelah Phase 0A selesai, lanjut Phase 0B untuk multi-sekolah dan role.
