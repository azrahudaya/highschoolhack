import bcrypt from 'bcryptjs';
import { Router } from 'express';
import type { AuthenticateOptions } from 'passport';
import { z } from 'zod';
import { getDefaultAppPath } from '../auth/user';
import { isGoogleAuthConfigured, passport } from '../auth/passport';
import { env } from '../config/env';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/async-handler';

const router = Router();

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(120),
});

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

    req.login(user, (error) => {
      if (error) {
        next(error);
        return;
      }

      res.status(201).json({
        user,
        redirectTo: '/onboarding',
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

if (isGoogleAuthConfigured) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: `${env.CLIENT_URL}/login?error=google` }),
    (req, res) => {
      res.redirect(`${env.CLIENT_URL}${req.user ? getDefaultAppPath(req.user) : '/login'}`);
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
