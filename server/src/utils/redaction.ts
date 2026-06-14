const sensitiveKeys = new Set([
  'password',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'set-cookie',
  'session',
  'database_url',
  'google_client_secret',
  'deepseek_api_key',
  'smtp_pass',
  'sentry_dsn',
]);

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const bearerPattern = /bearer\s+[a-z0-9._~+/=-]+/gi;
const tokenQueryPattern = /([?&](?:token|code|state)=)[^&\s]+/gi;
const cookiePattern = /(connect\.sid|highschoolhack\.sid|sid)=([^;\s]+)/gi;

export function redactText(value: unknown) {
  return String(value ?? '')
    .replace(emailPattern, '[redacted-email]')
    .replace(bearerPattern, 'Bearer [redacted]')
    .replace(tokenQueryPattern, '$1[redacted]')
    .replace(cookiePattern, '$1=[redacted]');
}

export function redactUrl(value: string | undefined) {
  return redactText(value ?? '');
}

export function redactObject<T>(value: T): T {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => redactObject(item)) as T;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => {
      if (sensitiveKeys.has(key) || sensitiveKeys.has(key.toLowerCase())) return [key, '[redacted]'];
      if (typeof item === 'string') return [key, redactText(item)];
      return [key, redactObject(item)];
    }),
  ) as T;
}
