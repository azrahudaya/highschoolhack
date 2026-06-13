# HighschoolHack Todo

Updated: 2026-06-13

Source compared: `highschoolhack-prompt_1.md`, `highschoolhack-prd.md`, `highschoolhack-technical-plan.md`, current React + Express + Prisma implementation.

## Current Product Decision

- Stack tetap React + Express + Prisma + Heroku Postgres.
- Sekolah dan kelas di onboarding tetap input manual. Sistem membuat school/class otomatis jika belum ada.
- Chatbot boleh memakai DeepSeek API, tetapi hanya lewat backend proxy.
- DeepSeek API key tidak boleh masuk client/browser.
- Chatbot tidak boleh menerima NISN, email, nomor telepon, atau data pribadi siswa.
- Chatbot tidak menyimpan isi percakapan ke database pada MVP ini.
- Untuk pilot sekolah, butuh privacy note/consent karena jawaban chatbot dikirim ke provider AI pihak ketiga.

## Completed

### P0/P1 Core Product

- [x] Public website selaras dengan prompt: landing copy, motivasi, program cards, artikel, about, program detail, 404.
- [x] Onboarding manual school/class.
- [x] Bekal 10 core: 7 modul, autosave, locked module UX, progress tracker, portfolio, badges, print.
- [x] RIASEC/VARK visual result, recommendation text, and disclaimer.
- [x] Student dashboard/profile shell.
- [x] Guru BK dashboard basic: metrics, search/filter, detail siswa, portfolio read-only, class summary, CSV export.
- [x] Admin sekolah basic: profile, classes, students, Guru BK assignment, duplicate class/school cleanup.
- [x] Responsive desktop/mobile polish and E2E coverage for public, auth, student, teacher, admin.

### Phase 2 - Setting Goal MVP

- [x] `/app/programs/setting-goal`.
- [x] Reuse enrollment/progress/module/autosave patterns.
- [x] Module 1: Kenali Diriku.
- [x] Module 2: Eksplorasi Program Studi.
- [x] Module 3: Eksplorasi Karier.
- [x] Module 4: Mata Pelajaran Pendukung with gap analysis.
- [x] Module 5: Goal Setting with SMART fields.
- [x] Module 6: Rencana Aksi with P1/P2 and 4-week plan.
- [x] Module 7: Dashboard Perkembangan with progress chart.
- [x] Module 8: Refleksi.
- [x] Setting Goal portfolio.
- [x] Setting Goal badge labels.
- [x] Guru BK cross-program summary MVP.

### Phase 3 - Smart Financial MVP

- [x] `/app/programs/smart-financial`.
- [x] Step 1: identity, target after graduation, allowance, savings, emergency fund.
- [x] Step 2: city destination selection.
- [x] City cost database MVP.
- [x] Step 3: 12-step board-game visual simulation.
- [x] Emergency event cards.
- [x] Readiness score formula:
  - savings ability 40%
  - decision score 30%
  - emergency fund 20%
  - risk control 10%
- [x] Result/recommendation module.
- [x] Academic, career, financial, and social recommendation fields.
- [x] Scholarship cards with official links.
- [x] Smart Financial portfolio and badge labels.
- [x] Guru BK cross-program summary MVP.

### Chatbot BK MVP

- [x] Floating student chatbot.
- [x] Backend-only DeepSeek proxy.
- [x] Server fallback answer when `DEEPSEEK_API_KEY` is not configured.
- [x] Client and server guard for sensitive identifiers.
- [x] Safety disclaimer: chatbot is not counselor/emergency support.
- [x] No chat-content persistence in database.

### Admin/Teacher Operations

- [x] Teacher notes/intervention tracking.
- [x] Admin audit log for sensitive actions.
- [x] Move student to another school for super admin.
- [x] Bulk import students/classes from CSV-like input.
- [x] Safer mobile admin layout for profile edit and bulk import.
- [x] Prisma migration for `TeacherNote` and `AuditLog`.

## Verified

- [x] `npm.cmd run build`
- [x] `npm.cmd run test:e2e`
- [x] 74 Playwright tests passed across desktop and mobile Chromium.

## Remaining Before Production Pilot

### Deploy and Config

- [x] Run `npm run prisma:deploy` on Heroku after pushing the new migration.
- [ ] Set Heroku config vars:
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_BASE_URL=https://api.deepseek.com`
  - `DEEPSEEK_MODEL=deepseek-v4-flash`
- [ ] Verify Google OAuth sign-in on:
  - `https://highschoolhack.my.id`
  - `https://www.highschoolhack.my.id`
- [ ] Confirm Heroku only has the intended PostgreSQL add-on attached.
- [x] Run production HTTP smoke test after deploy: health, public page, auth config.
- [ ] Run production logged-in smoke test after deploy: register/login, onboarding, one module autosave, admin page, chatbot fallback/API response.

### Data Privacy and AI Safety

- [x] Add public privacy/AI disclosure page before school pilot.
- [x] Add explicit consent copy before students use chatbot.
- [x] Add rate limiting for `/api/chatbot/message`.
- [ ] Add admin setting to disable chatbot per school if needed.
- [ ] Decide whether DeepSeek is acceptable for school/student data under the pilot's privacy requirements.

### Product Depth

- [ ] Replace Smart Financial city select with search/autocomplete.
- [ ] Expand city cost database and add source/update date per city.
- [ ] Add scholarship search/filter and refresh official links.
- [ ] Add detailed Guru BK distributions:
  - Setting Goal: active goals, career distribution, study program distribution, progress by class.
  - Smart Financial: readiness distribution, high-risk students, popular cities, after-graduation target distribution.
- [ ] Add real PDF export. Current MVP uses browser print/save PDF.
- [ ] Check portfolio print layout manually on A4 after deploy.

### Testing Debt

- [ ] Add unit tests for school/class find-or-create normalization.
- [ ] Add duplicate NISN conflict test.
- [ ] Add backend tests for chatbot sensitive-data guard.
- [ ] Add visual regression screenshots for home, articles, onboarding, Bekal 10 dashboard, module results, and portfolio print.

## Next Phase

The next phase should be **Production Hardening and Heroku Deploy**, not more feature expansion. The product now has enough feature surface for a serious demo; adding more features before deploy will increase risk faster than it increases product quality.
