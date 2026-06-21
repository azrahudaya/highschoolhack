require('dotenv/config');

const missing = process.argv.slice(2).filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing required environment variable${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}`);
  console.error('Create/update .env from .env.example before running this command.');
  process.exit(1);
}
