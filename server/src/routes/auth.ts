import bcrypt from 'bcryptjs';
import { Router } from 'express';
import type { AuthenticateOptions } from 'passport';
import { z } from 'zod';
import { getDefaultAppPath } from '../auth/user';
import { isGoogleAuthConfigured, passport } from '../auth/passport';
import { env } from '../config/env';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/async-handler';
import { requireAuth } from '../middleware/auth';
import { consumeEmailVerificationToken, consumePasswordResetToken, createEmailVerificationToken, createPasswordResetToken } from '../services/auth-tokens';
import { sendEmailVerificationEmail, sendPasswordResetEmail } from '../services/email';
import { logger } from '../utils/logger';

const router = Router();

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(120),
});

const emailSchema = z.object({
  email: z.string().trim().email(),
});

const passwordResetConfirmSchema = z.object({
  token: z.string().trim().min(20),
  password: z.string().min(8).max(128),
});

const tokenSchema = z.object({
  token: z.string().trim().min(20),
});

function authDevTokenResponse(token: string | null, extra: Record<string, unknown> = {}) {
  return {
    ...extra,
    ...(env.NODE_ENV !== 'production' && token ? { devToken: token } : {}),
  };
}

router.get('/me', (req, res) => {
  res.json({
    user: req.user ?? null,
    authenticated: req.isAuthenticated(),
    googleAuthConfigured: isGoogleAuthConfigured,
  });
});

router.post(
  '/register',
  asyncHandler(async (req, res, next) => {
    const payload = registerSchema.parse(req.body);
    const email = payload.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(409).json({
        error: 'EmailExists',
        message: 'Email sudah terdaftar. Silakan login.',
      });
      return;
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: payload.name,
        passwordHash: await bcrypt.hash(payload.password, 12),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerifiedAt: true,
        memberships: {
          select: {
            id: true,
            role: true,
            school: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    const verification = await createEmailVerificationToken(user.id);
    const delivery = await sendEmailVerificationEmail(user.email, verification.token, verification.expiresInHours);
    logger.info('auth.register', { userId: user.id, email: user.email, emailVerificationQueued: delivery.queued });

    req.login(user, (error) => {
      if (error) {
        next(error);
        return;
      }

      res.status(201).json({
        user,
        redirectTo: '/onboarding',
        ...authDevTokenResponse(verification.token, { emailVerificationQueued: delivery.queued }),
      });
    });
  }),
);

router.post('/login', (req, res, next) => {
  credentialsSchema.parse(req.body);

  const options: AuthenticateOptions = {
    session: true,
  };

  passport.authenticate('local', options, (error: Error | null, user: Express.User | false, info?: { message?: string }) => {
    if (error) {
      next(error);
      return;
    }

    if (!user) {
      res.status(401).json({
        error: 'InvalidCredentials',
        message: info?.message ?? 'Email atau password tidak sesuai.',
      });
      return;
    }

    req.login(user, (loginError) => {
      if (loginError) {
        next(loginError);
        return;
      }

      res.json({
        user,
        redirectTo: getDefaultAppPath(user),
      });
    });
  })(req, res, next);
});

router.post('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) {
      next(error);
      return;
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        next(sessionError);
        return;
      }

      res.clearCookie(env.SESSION_NAME);
      res.status(204).send();
    });
  });
});

router.post(
  '/password-reset/request',
  asyncHandler(async (req, res) => {
    const payload = emailSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
    let devToken: string | null = null;

    if (user?.passwordHash) {
      const reset = await createPasswordResetToken(user.id);
      devToken = reset.token;
      await sendPasswordResetEmail(user.email, reset.token, reset.expiresInMinutes);
    }
    logger.info('auth.passwordResetRequested', { email: payload.email, matchedUser: Boolean(user?.passwordHash) });

    res.status(202).json(authDevTokenResponse(devToken, {
      message: 'Jika email terdaftar, instruksi reset password akan dikirim.',
    }));
  }),
);

router.post(
  '/password-reset/confirm',
  asyncHandler(async (req, res) => {
    const payload = passwordResetConfirmSchema.parse(req.body);
    const token = await consumePasswordResetToken(payload.token);
    if (!token) {
      res.status(400).json({ error: 'InvalidToken', message: 'Token reset password tidak valid atau sudah kedaluwarsa.' });
      return;
    }

    await prisma.user.update({
      where: { id: token.userId },
      data: { passwordHash: await bcrypt.hash(payload.password, 12) },
    });
    logger.info('auth.passwordResetConfirmed', { userId: token.userId });
    res.json({ message: 'Password berhasil diperbarui. Silakan login kembali.' });
  }),
);

router.post(
  '/email-verification/request',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ error: 'UserNotFound', message: 'Akun tidak ditemukan.' });
      return;
    }
    if (user.emailVerifiedAt) {
      res.json({ message: 'Email sudah terverifikasi.' });
      return;
    }

    const verification = await createEmailVerificationToken(user.id);
    const delivery = await sendEmailVerificationEmail(user.email, verification.token, verification.expiresInHours);
    logger.info('auth.emailVerificationRequested', { userId: user.id, queued: delivery.queued });
    res.status(202).json(authDevTokenResponse(verification.token, {
      message: 'Instruksi verifikasi email telah dikirim.',
      emailVerificationQueued: delivery.queued,
    }));
  }),
);

router.post(
  '/email-verification/confirm',
  asyncHandler(async (req, res) => {
    const payload = tokenSchema.parse(req.body);
    const token = await consumeEmailVerificationToken(payload.token);
    if (!token) {
      res.status(400).json({ error: 'InvalidToken', message: 'Token verifikasi email tidak valid atau sudah kedaluwarsa.' });
      return;
    }

    await prisma.user.update({
      where: { id: token.userId },
      data: { emailVerifiedAt: new Date() },
    });
    logger.info('auth.emailVerified', { userId: token.userId });
    res.json({ message: 'Email berhasil diverifikasi.' });
  }),
);

if (isGoogleAuthConfigured) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/link', requireAuth, (req, res, next) => {
    req.session.googleLinkUserId = req.user!.id;
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  });
  router.get(
    '/google/callback',
    (req, res, next) => {
      passport.authenticate('google', (error: Error | null, user: Express.User | false, info?: { message?: string }) => {
        if (error) {
          next(error);
          return;
        }
        if (!user) {
          const code = info?.message ?? 'google';
          res.redirect(`${env.CLIENT_URL}/login?error=${encodeURIComponent(code)}`);
          return;
        }
        req.login(user, (loginError) => {
          if (loginError) {
            next(loginError);
            return;
          }
          res.redirect(`${env.CLIENT_URL}${getDefaultAppPath(user)}`);
        });
      })(req, res, next);
    },
  );
} else {
  router.get('/google', (_req, res) => {
    res.status(503).json({
      error: 'GoogleAuthNotConfigured',
      message: 'Google OAuth belum dikonfigurasi.',
    });
  });

  router.get('/google/callback', (_req, res) => {
    res.redirect(`${env.CLIENT_URL}/login?error=google-not-configured`);
  });
}

export const authRouter = router;
