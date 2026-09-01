# HighschoolHack Heroku Postgres Backup Runbook

Updated: 2026-06-14

> Operational draft for authorized operators only. This repository is a portfolio prototype. Do not run these commands against a live school environment without explicit change approval, a designated data owner, and a verified restore target. Never download real student data into the repository or an unmanaged workstation.

App: `highschoolhack-app`
Primary database attachment: `DATABASE`
Current plan target: Heroku Postgres Essential

## Why This Exists

HighschoolHack stores student profiles, school memberships, program answers, teacher notes, audit logs, auth sessions, and auth reset/verification tokens in Postgres. Before a real school pilot, database backup and restore must be treated as an operating procedure, not an afterthought.

Heroku PGBackups creates logical backups with `pg_dump`/`pg_restore`. Heroku notes that PGBackups is appropriate for small/moderately loaded databases and that Essential-tier databases do not provide rollback/fork/follower features. Use logical backups for portability and pilot safety.

References:

- Heroku PGBackups: https://devcenter.heroku.com/articles/heroku-postgres-backups
- Heroku Postgres logical backups: https://devcenter.heroku.com/articles/heroku-postgres-logical-backups
- Heroku Postgres data safety and Essential-tier rollback limits: https://devcenter.heroku.com/articles/heroku-postgres-data-safety-and-continuous-protection
- Heroku CLI backup commands: https://devcenter.heroku.com/articles/heroku-cli-commands

## First-Time Setup

Check the current database:

```powershell
heroku pg:info -a highschoolhack-app
```

Schedule a daily logical backup. Use a low-traffic time. This example runs at 03:00 Jakarta time:

```powershell
heroku pg:backups:schedule DATABASE --at "03:00 Asia/Jakarta" -a highschoolhack-app
```

Confirm the schedule:

```powershell
heroku pg:backups:schedules -a highschoolhack-app
```

## Manual Backup Before Risky Changes

Run this before migrations, bulk imports, admin cleanup, school merge, or production data fixes:

```powershell
heroku pg:backups:capture DATABASE -a highschoolhack-app
heroku pg:backups -a highschoolhack-app
heroku pg:backups:info -a highschoolhack-app
```

Download the newest backup only to an approved managed workstation or encrypted storage location with access control and retention policy. Confirm the destination before starting the download. If the backup is downloaded temporarily, remove the local copy after verifying the managed copy.

```powershell
$backupDir = "$env:HIGHSCHOOLHACK_MANAGED_BACKUP_DIR"
if (-not $backupDir) { throw "Set HIGHSCHOOLHACK_MANAGED_BACKUP_DIR to an approved encrypted storage path." }
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
heroku pg:backups:download -a highschoolhack-app -o "$backupDir\highschoolhack-$(Get-Date -Format yyyyMMdd-HHmm).dump"
```

Do not commit `.dump` files into GitHub. Do not use a personal laptop directory as the backup destination.

## Weekly Verification

Once per week:

1. Run `heroku pg:backups -a highschoolhack-app`.
2. Confirm the latest backup completed.
3. Download the latest backup.
4. Restore it to staging or a disposable Heroku app.
5. Run smoke tests against staging.

Create a temporary staging DB if needed:

```powershell
heroku create highschoolhack-restore-check
heroku addons:create heroku-postgresql:essential-0 -a highschoolhack-restore-check
```

Restore latest production backup into staging:

```powershell
heroku pg:backups:restore highschoolhack-app::latest DATABASE_URL -a highschoolhack-restore-check --confirm highschoolhack-restore-check
heroku run "npm run prisma:deploy" -a highschoolhack-restore-check
```

Then deploy the same app code to staging or run direct database smoke checks before deleting the temporary app.

## Production Restore Procedure

Only restore production when the team agrees data loss/corruption is worse than rolling back to the backup.

1. Announce maintenance window.
2. Capture one last backup if the database is still reachable.
3. Turn maintenance mode on.
4. Restore selected backup.
5. Run migrations.
6. Smoke test login, onboarding, modules, portfolio PDF, admin, and teacher dashboard.
7. Turn maintenance mode off.

Commands:

```powershell
heroku maintenance:on -a highschoolhack-app
heroku pg:backups:capture DATABASE -a highschoolhack-app
heroku pg:backups -a highschoolhack-app
heroku pg:backups:restore b001 DATABASE_URL -a highschoolhack-app --confirm highschoolhack-app
heroku run "npm run prisma:deploy" -a highschoolhack-app
heroku maintenance:off -a highschoolhack-app
```

Replace `b001` with the exact backup ID chosen from `heroku pg:backups`.

If any restore, migration, or smoke test command fails, stop the procedure, keep maintenance mode enabled, record the failing command and backup ID, and escalate to the designated operator. Do not retry destructive restore commands without confirming the target. After the incident decision is made, explicitly verify the application state and run `heroku maintenance:off -a highschoolhack-app` when it is safe to reopen traffic.

Important: `pg:backups:restore` replaces database contents. Always test restore on staging first when possible.

## Backup Handling Rules

- Store downloaded backups outside the Git repo.
- Treat backups as sensitive student data.
- Restrict access to the Heroku account and external backup storage.
- Delete old local backup files from personal laptops after uploading to approved encrypted storage.
- Never paste backup URLs publicly. Heroku backup URLs are secret but accessible to anyone who has the URL.

## Pilot Minimum Checklist

- [ ] Daily backup schedule exists.
- [ ] Latest backup download tested.
- [ ] Restore to staging tested.
- [ ] Production restore command reviewed by two people.
- [ ] Backup storage owner decided.
- [ ] Incident contact list decided.
