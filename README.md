# highschoolhack

[![ci](https://github.com/azrahudaya/highschoolhack/actions/workflows/ci.yml/badge.svg)](https://github.com/azrahudaya/highschoolhack/actions/workflows/ci.yml)

Platform bimbingan dan perencanaan masa depan untuk siswa SMA Indonesia. HighschoolHack menggabungkan program pengembangan diri, eksplorasi studi dan karier, simulasi kesiapan finansial, portofolio siswa, serta dashboard Guru BK.

## status dan positioning

Project ini adalah prototype produk dan portfolio engineering. Source code menunjukkan arah arsitektur multi-sekolah dengan autentikasi, PostgreSQL, Prisma, React, dan Express, tetapi belum boleh dianggap production-ready atau sebagai pengganti Guru BK, psikolog, konselor profesional, atau penasihat finansial.

Fitur utama yang sudah ada di source:

- public website dan artikel edukatif
- alur program siswa untuk kelas X, XI, dan XII
- progress tracker dan portofolio perkembangan
- dashboard Guru BK dan admin sekolah
- autentikasi email/password dan Google OAuth
- chatbot berbasis API eksternal yang dikendalikan environment variable
- export laporan PDF

## stack

- client: React, Vite, TypeScript, Tailwind CSS
- server: Express 5, TypeScript, Zod
- database: PostgreSQL dan Prisma
- auth: express-session, Passport, bcryptjs
- quality: ESLint, TypeScript, GitHub Actions

## development

Requirements: Node.js 22 atau lebih baru dan npm.

```bash
npm ci
cp .env.example .env
npm run prisma:generate
npm run dev
```

Perintah quality gate:

```bash
npm run build
npm run lint
```

`npm run lint` menjalankan ESLint, typecheck, build client/server, dan `git diff --check`. CI juga menginstal Chromium lalu menjalankan E2E test Chromium secara serial pada setiap push ke `main` serta pull request.

## konfigurasi

Salin `.env.example` ke `.env`. Jangan commit `.env` atau nilai secret.

Environment penting:

- `DATABASE_URL` untuk PostgreSQL
- `SESSION_SECRET` untuk session cookie
- `CLIENT_URL` dan `GOOGLE_*` untuk OAuth
- `DEEPSEEK_API_KEY` untuk chatbot, jika fitur tersebut diaktifkan
- `SMTP_*` untuk email verifikasi dan reset password
- `SENTRY_DSN` untuk error monitoring opsional

Pada production, `DATABASE_URL` dan `SESSION_SECRET` wajib dikonfigurasi. Nilai development default tidak boleh digunakan.

## data dan privacy

Aplikasi dapat memproses nama, email, identitas sekolah, jawaban program, catatan Guru BK, session autentikasi, token reset/verifikasi, serta data simulasi finansial siswa. Data tersebut harus dianggap sensitif.

- gunakan data dummy untuk development dan demo
- jangan memasukkan data siswa nyata ke repository, issue, log, atau screenshot publik
- review retention, akses role, backup, penghapusan, dan incident response sebelum pilot sekolah
- konten chatbot dapat diproses oleh layanan AI eksternal jika `DEEPSEEK_API_KEY` diaktifkan
- data finansial di aplikasi adalah alat edukasi, bukan nasihat finansial profesional

Runbook backup PostgreSQL tersedia di `docs/heroku-postgres-backup-runbook.md`. Runbook hanya untuk operator yang berwenang dan tidak boleh dijalankan terhadap production tanpa change approval.

## security

Lihat `SECURITY.md` untuk batasan security dan pelaporan kerentanan secara privat. Jangan membuka issue publik untuk credential, data siswa, atau detail eksploitasi yang belum diperbaiki.

## license

Source ini menggunakan restricted project license. Penggunaan komersial, production, layanan publik, branding, dan data model untuk pihak lain memerlukan izin tertulis. Lihat `LICENSE.md`.
