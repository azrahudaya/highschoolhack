# security policy

## scope

HighschoolHack is a portfolio and educational prototype. It may handle student profiles, school memberships, program answers, teacher notes, authentication data, and financial simulation data. Do not use real student data in local development, demos, issues, pull requests, or screenshots.

The repository is not a promise of production security or regulatory compliance. A school pilot requires a separate privacy review, access review, retention policy, backup procedure, incident response plan, and operational owner.

## reporting

Please report suspected vulnerabilities privately through GitHub Security Advisories:

https://github.com/azrahudaya/highschoolhack/security/advisories/new

If private reporting is unavailable, contact the repository owner through the email address listed on the GitHub profile. Do not publish credentials, personal data, or unpatched exploit details in a public issue.

Include:

- affected component and commit or release
- reproducible steps using dummy data
- security impact
- suggested mitigation, if known

## secret handling

- keep `.env` files, API keys, OAuth secrets, SMTP passwords, session secrets, database URLs, and backup dumps outside Git
- use `.env.example` only for empty configuration names
- rotate any credential that may have been exposed
- test accounts and passwords in automated tests are fixtures, not production credentials
- redact tokens, email addresses, authorization headers, and personal data from logs

## data handling

Backups must be encrypted, access-controlled, retention-limited, and stored outside the repository. Follow `docs/heroku-postgres-backup-runbook.md` only with explicit authorization for the target environment.

## supported versions

Only the latest `main` branch is actively reviewed. This is a prototype and does not provide a guaranteed security support window.
