import bcrypt from 'bcryptjs';
import type { Request } from 'express';
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

        if (env.REQUIRE_EMAIL_VERIFICATION && !user.emailVerifiedAt) {
          done(null, false, { message: 'Verifikasi email terlebih dahulu sebelum login.' });
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
        passReqToCallback: true,
      },
      async (req: Request, accessToken, refreshToken, profile, done) => {
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

          if (req.session.googleLinkUserId) {
            const currentUserId = req.session.googleLinkUserId;
            delete req.session.googleLinkUserId;
            const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
            if (!currentUser) {
              done(null, false, { message: 'GoogleLinkUserMissing' });
              return;
            }
            if (currentUser.email.toLowerCase() !== email) {
              done(null, false, { message: 'GoogleEmailMismatch' });
              return;
            }
            if (existingAccount && existingAccount.userId !== currentUserId) {
              done(null, false, { message: 'GoogleAccountAlreadyLinked' });
              return;
            }

            await prisma.$transaction([
              prisma.user.update({
                where: { id: currentUserId },
                data: {
                  name: currentUser.name ?? profile.displayName,
                  image: currentUser.image ?? profile.photos?.[0]?.value,
                  emailVerifiedAt: currentUser.emailVerifiedAt ?? new Date(),
                },
              }),
              prisma.authAccount.upsert({
                where: {
                  provider_providerAccountId: {
                    provider: 'google',
                    providerAccountId: profile.id,
                  },
                },
                update: { accessToken, refreshToken },
                create: {
                  userId: currentUserId,
                  provider: 'google',
                  providerAccountId: profile.id,
                  accessToken,
                  refreshToken,
                },
              }),
            ]);

            const authUser = await getAuthUser(currentUserId);
            done(null, authUser ?? false);
            return;
          }

          if (!userId) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser?.passwordHash) {
              done(null, false, { message: 'GoogleAccountNeedsExplicitLink' });
              return;
            }

            const user = existingUser
              ? await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  name: profile.displayName,
                  image: profile.photos?.[0]?.value,
                  emailVerifiedAt: existingUser.emailVerifiedAt ?? new Date(),
                },
              })
              : await prisma.user.create({
                data: {
                  email,
                  name: profile.displayName,
                  image: profile.photos?.[0]?.value,
                  emailVerifiedAt: new Date(),
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
          } else {
            await prisma.$transaction([
              prisma.user.update({
                where: { id: userId },
                data: {
                  name: profile.displayName,
                  image: profile.photos?.[0]?.value,
                  emailVerifiedAt: new Date(),
                },
              }),
              prisma.authAccount.update({
                where: {
                  provider_providerAccountId: {
                    provider: 'google',
                    providerAccountId: profile.id,
                  },
                },
                data: { accessToken, refreshToken },
              }),
            ]);
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
