import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import { env } from '../config/env';
import { prisma } from '../db/prisma';
import { getAuthUser } from './user';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId: string, done) => {
  try {
    const user = await getAuthUser(userId);
    done(null, user ?? false);
  } catch (error) {
    done(error);
  }
});

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
          done(null, false, { message: 'Email atau password tidak sesuai.' });
          return;
        }

        const authUser = await getAuthUser(user.id);
        done(null, authUser ?? false);
      } catch (error) {
        done(error);
      }
    },
  ),
);

export const isGoogleAuthConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

if (isGoogleAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();

          if (!email) {
            done(new Error('Akun Google tidak memberikan alamat email.'));
            return;
          }

          const existingAccount = await prisma.authAccount.findUnique({
            where: {
              provider_providerAccountId: {
                provider: 'google',
                providerAccountId: profile.id,
              },
            },
          });

          let userId = existingAccount?.userId;

          if (!userId) {
            const user = await prisma.user.upsert({
              where: { email },
              update: {
                name: profile.displayName,
                image: profile.photos?.[0]?.value,
              },
              create: {
                email,
                name: profile.displayName,
                image: profile.photos?.[0]?.value,
              },
            });

            userId = user.id;

            await prisma.authAccount.create({
              data: {
                userId,
                provider: 'google',
                providerAccountId: profile.id,
                accessToken,
                refreshToken,
              },
            });
          }

          const authUser = await getAuthUser(userId);
          done(null, authUser ?? false);
        } catch (error) {
          done(error);
        }
      },
    ),
  );
}

export { passport };
