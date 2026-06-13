import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().optional(),
  SESSION_SECRET: z.string().default('dev-session-secret-change-me'),
  SESSION_NAME: z.string().default('highschoolhack.sid'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().default('http://localhost:4000/api/auth/google/callback'),
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().url().default('https://api.deepseek.com'),
  DEEPSEEK_MODEL: z.string().default('deepseek-v4-flash'),
});

export const env = envSchema.parse(process.env);
