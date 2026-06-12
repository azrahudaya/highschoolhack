import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';
import { Pool } from 'pg';
import { env } from '../config/env';

export function createSessionMiddleware() {
  if (env.NODE_ENV === 'production' && !env.DATABASE_URL) {
    throw new Error('DATABASE_URL wajib tersedia untuk session PostgreSQL di production.');
  }

  if (env.NODE_ENV === 'production' && env.SESSION_SECRET === 'dev-session-secret-change-me') {
    throw new Error('SESSION_SECRET production belum dikonfigurasi.');
  }

  const store = env.DATABASE_URL
    ? new (connectPgSimple(session))({
        pool: new Pool({
          connectionString: env.DATABASE_URL,
          ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        }),
        tableName: 'user_sessions',
        createTableIfMissing: true,
      })
    : undefined;

  if (!store && env.NODE_ENV === 'development') {
    console.warn('DATABASE_URL belum tersedia. Development menggunakan memory session sementara.');
  }

  return session({
    name: env.SESSION_NAME,
    secret: env.SESSION_SECRET,
    store,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  });
}
