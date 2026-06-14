# HighschoolHack Todo

Updated: 2026-06-14

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

### Class X Bekal 10 Revision

- [x] Module 2 explains the RIASEC 1-5 scale before students answer.
- [x] Module 2 flow is now assessment first, result and narrative second, reflection third.
- [x] Module 2 RIASEC results include fuller narratives, strengths, example majors, example careers, and next exploration steps.
- [x] Module 2 VARK results include learning-style explanation and concrete study strategies.
- [x] Module 4 explains SMART goal before the form, including S/M/A/R/T meaning and a clear example.

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

### Class XII Future Ready Board Revision

- [x] Money inputs no longer force a leading `0`; empty fields can stay empty and pasted values such as `0500000` become `500000`.
- [x] Module 3 renamed and reframed as `Future Ready Board`, closer to the `future-ready-Iya.pdf` reference flow.
- [x] 12-step simulation is clickable; decisions update score, risk, lives, balance, badge, and autosave payload.
- [x] Emergency card button is clickable and updates the simulation state.
- [x] Final decision recommendation is shown from the simulation result.
- [x] Scholarship portal exists as `/app/programs/smart-financial/scholarships` with search/filter and official links.
- [x] Smart Financial portfolio has a direct PDF download endpoint.
- [x] Smart Financial public CTAs preserve `/app/programs/smart-financial` so class XII users do not fall back to Bekal 10.

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
- [x] 84 Playwright tests passed across desktop and mobile Chromium.
- [x] `npm.cmd audit --omit=dev --audit-level=high`
- [x] 0 production dependency vulnerabilities after `npm audit fix`.
- [x] Heroku release `v24` deployed from commit `b320c20`.
- [x] Heroku release command applied migration `20260614000000_scope_module_response_by_enrollment`.
- [x] Production logged-in smoke test passed on `https://highschoolhack.my.id` with Smart Financial PDF export artifact.

## Audit 2026-06-14

### P0 - Data Integrity and Access Control

- [ ] Add active school/class context instead of always using the first membership. Current student, teacher, and admin flows can pick the wrong school when one user has multiple memberships.
- [x] Scope `ModuleResponse` by school/enrollment, not only `userId + moduleId`, so the same student cannot accidentally share answers across different schools or repeated enrollments.
- [x] Add backend validation schemas per module for Setting Goal and Smart Financial. Generic payload validation can mark modules complete even when required fields are still shallow or default-only.
- [x] Decide and enforce completed-module edit behavior for Setting Goal and Smart Financial. Current generic modules are still editable after completion, while Bekal 10 is read-only.
- [ ] Add backend permission tests for cross-school isolation: student, teacher BK, school admin, and super admin.

### P0 - Production Security and Stability

- [x] Fix npm package tree / package-lock health so `npm audit --omit=dev --audit-level=high` can run successfully.
- [x] Resolve the high-severity dependency warning shown during Heroku deploy before school pilot.
- [x] Add CSRF or strict origin protection for cookie-authenticated state-changing routes.
- [x] Strengthen chatbot PII guard for Indonesian phone formats with spaces/dashes, addresses, NISN variants, and pasted student identity text.
- [ ] Add password reset, email verification, and clearer Google/email account-linking behavior before inviting real schools.
- [ ] Add Sentry or equivalent error monitoring, structured logs, and log redaction for auth, onboarding, module save, PDF export, and chatbot errors.
- [ ] Add Heroku Postgres backup/restore runbook and confirm automated backups before pilot.

### P1 - UX Bugs and Product Fit

- [x] Make the student dashboard grade-aware. A class XII student should land on Smart Financial by default, class XI on Setting Goal, and class X on Bekal 10.
- [ ] Add school/role switcher for users who belong to multiple schools or roles.
- [x] Add a clearer locked-module experience with a direct back/go-to-previous-module action.
- [ ] Add autosave timestamp, retry state, and navigation guard for Setting Goal and Smart Financial, matching the Bekal 10 safety feel.
- [x] Remove or route stale `PortalPage.tsx` protected shell code from Phase 0C.
- [ ] Refactor very large JSX blocks in `ProgramModuleAppPage`, `Bekal10AdvancedModules`, and `AdminSchoolPage` into smaller components before adding more feature depth.

### P1 - Prompt/PRD Feature Gaps

- [ ] Expand Setting Goal with a real study-program reference database: what is studied, supporting subjects, skills, career paths, and campus examples.
- [ ] Expand Setting Goal with a career reference database: job description, competencies, education path, prospects, and suggested majors.
- [ ] Upgrade Setting Goal gap analysis into a real current-vs-target table with recommended actions.
- [ ] Upgrade Setting Goal action planning into an interactive calendar/board with P1-P4 priorities and multiple action items.
- [ ] Add recurring reflection/journal history for Setting Goal.
- [ ] Expand Smart Financial city database beyond the MVP cities, with source and last-updated date.
- [ ] Replace Smart Financial city select with search/autocomplete.
- [ ] Make Future Ready Board closer to the prompt/reference: 3 choices per step, randomized emergency events, stronger consequence narration, and clearer end-state summary.
- [ ] Add Smart Financial fields that are still missing from the reference flow: nickname, school, class, city origin, and interest/major target.
- [ ] Expand scholarship portal with deadlines, coverage, country/region, eligibility, status, and last-verified date.
- [ ] Decide whether leaderboard should ship. If yes, design it carefully so it motivates without exposing sensitive student ranking.
- [ ] Add Guru BK detailed analytics for Setting Goal and Smart Financial: distributions, high-risk students, popular cities, targets, and class progress.
- [ ] Add school report export for Guru BK/admin, including CSV/XLSX and PDF summary.

### P1 - Portfolio and PDF Quality

- [ ] Replace the simple one-page PDF writer with a multi-page PDF renderer. Current PDF can silently truncate long content.
- [ ] Add cover, student profile, school/class, date, score summary, recommendation, conclusion, and QR code to Smart Financial PDF as described in the prompt.
- [ ] Verify A4 print/export visually on mobile and desktop for Bekal 10, Setting Goal, and Smart Financial.
- [ ] Add automated PDF content tests so key answers and recommendations are not missing from exports.

### P2 - Content and Operations

- [ ] Add content freshness process for articles, scholarship links, city costs, majors, careers, and external references.
- [ ] Add admin content management or a safer structured data workflow so articles/program references are not hardcoded forever.
- [ ] Add school-level feature flags: enable/disable programs, chatbot, scholarships, and experimental modules per school.
- [ ] Add data retention, data export, and student data deletion workflows aligned with the public privacy page.
- [x] Fix seed consistency: Smart Financial module title should match `Future Ready Board`, and seed log should print the actual demo school slug.

### Testing Debt From Audit

- [ ] Add unit tests for school/class find-or-create normalization.
- [ ] Add duplicate NISN conflict test.
- [ ] Add backend tests for chatbot sensitive-data guard.
- [ ] Add backend tests for module completion validation and completed-module edit rules.
- [ ] Add backend tests for PDF export content and long-response behavior.
- [ ] Add visual regression screenshots for home, articles, onboarding, dashboards, module results, and portfolio print.
- [ ] Add load/performance test data for teacher/admin dashboards with hundreds of students.
- [ ] Add production logged-in smoke checklist for `https://highschoolhack.my.id` after every deploy.

## Remaining Before Production Pilot

### Deploy and Config

- [x] Push and deploy current audit-fix changes, then run `npm run prisma:deploy` on Heroku for migration `20260614000000_scope_module_response_by_enrollment`.
- [ ] Set Heroku config vars:
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_BASE_URL=https://api.deepseek.com`
  - `DEEPSEEK_MODEL=deepseek-v4-flash`
- [ ] Verify Google OAuth sign-in on:
  - `https://highschoolhack.my.id`
  - `https://www.highschoolhack.my.id`
- [x] Resolve duplicate Heroku PostgreSQL add-on. Production now only has `DATABASE` / `postgresql-objective-97839`.
- [x] Run production HTTP smoke test after deploy: health, public page, auth config.
- [x] Run production logged-in smoke test after deploy: register/login, onboarding, one module autosave, Smart Financial completion, portfolio PDF export, chatbot PII guard.

### Data Privacy and AI Safety

- [x] Add public privacy/AI disclosure page before school pilot.
- [x] Add explicit consent copy before students use chatbot.
- [x] Add rate limiting for `/api/chatbot/message`.
- [ ] Add admin setting to disable chatbot per school if needed.
- [ ] Decide whether DeepSeek is acceptable for school/student data under the pilot's privacy requirements.

### Product Depth

- [ ] Replace Smart Financial city select with search/autocomplete.
- [ ] Expand city cost database and add source/update date per city.
- [x] Add scholarship search/filter and official links.
- [ ] Add detailed Guru BK distributions:
  - Setting Goal: active goals, career distribution, study program distribution, progress by class.
  - Smart Financial: readiness distribution, high-risk students, popular cities, after-graduation target distribution.
- [x] Add server-side PDF export for program portfolio.
- [ ] Check portfolio print layout manually on A4 after deploy.

### Testing Debt

- [ ] Add unit tests for school/class find-or-create normalization.
- [ ] Add duplicate NISN conflict test.
- [ ] Add backend tests for chatbot sensitive-data guard.
- [ ] Add visual regression screenshots for home, articles, onboarding, Bekal 10 dashboard, module results, and portfolio print.

## Next Phase

The next phase should be **Audit Fix Sprint and Pilot Readiness**, not new feature expansion. The product now has enough feature surface for a serious demo; the highest-value work is fixing data isolation, validation, security, PDF quality, and production smoke checks before inviting real schools.
