import * as Sentry from '@sentry/node';
import type { Express } from 'express';
import { env } from '../config/env';
import { redactObject, redactText } from '../utils/redaction';

export const sentryEnabled = Boolean(env.SENTRY_DSN);

export function initSentry() {
  if (!sentryEnabled) return;

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
    integrations: [Sentry.expressIntegration()],
    beforeSend(event) {
      if (event.request) {
        event.request.headers = redactObject(event.request.headers);
        event.request.cookies = redactObject(event.request.cookies);
        event.request.query_string = redactText(event.request.query_string);
        event.request.data = redactObject(event.request.data);
      }
      event.extra = redactObject(event.extra);
      event.contexts = redactObject(event.contexts);
      return event;
    },
  });
}

export function setupSentryErrorHandler(app: Express) {
  if (!sentryEnabled) return;
  Sentry.setupExpressErrorHandler(app);
}

export function captureException(error: unknown, extra?: Record<string, unknown>) {
  if (!sentryEnabled) return;
  Sentry.captureException(error, { extra: redactObject(extra ?? {}) });
}
