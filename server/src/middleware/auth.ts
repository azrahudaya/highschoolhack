import type { UserRole } from '@prisma/client';
import type { RequestHandler } from 'express';
import { hasRole } from '../auth/user';

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Silakan login terlebih dahulu.',
    });
    return;
  }

  next();
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Silakan login terlebih dahulu.',
      });
      return;
    }

    if (!hasRole(req.user, roles)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Anda tidak memiliki akses ke area ini.',
      });
      return;
    }

    next();
  };
}
