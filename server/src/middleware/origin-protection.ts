import type { RequestHandler } from 'express';
import { env } from '../config/env';

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function originOf(value: string | undefined) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export const originProtection: RequestHandler = (req, res, next) => {
  if (!unsafeMethods.has(req.method)) {
    next();
    return;
  }

  const requestOrigin = originOf(req.get('origin')) ?? originOf(req.get('referer'));
  if (!requestOrigin) {
    next();
    return;
  }

  const host = req.get('host');
  const sameOrigin = host ? `${req.protocol}://${host}` : null;
  const allowedOrigins = new Set([env.CLIENT_URL, sameOrigin].filter(Boolean));

  if (!allowedOrigins.has(requestOrigin)) {
    res.status(403).json({
      error: 'InvalidOrigin',
      message: 'Permintaan ditolak karena origin tidak sesuai.',
    });
    return;
  }

  next();
};
