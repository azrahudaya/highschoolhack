import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../db/prisma';

const passwordResetMinutes = 30;
const emailVerificationHours = 24;

export function hashAuthToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function createToken() {
  return randomBytes(32).toString('base64url');
}

function expiresInMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function expiresInHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export async function createPasswordResetToken(userId: string) {
  const token = createToken();
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashAuthToken(token),
      expiresAt: expiresInMinutes(passwordResetMinutes),
    },
  });
  return { token, expiresInMinutes: passwordResetMinutes };
}

export async function createEmailVerificationToken(userId: string) {
  const token = createToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashAuthToken(token),
      expiresAt: expiresInHours(emailVerificationHours),
    },
  });
  return { token, expiresInHours: emailVerificationHours };
}

export async function consumePasswordResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashAuthToken(token) },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date()) return null;

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
  return record;
}

export async function consumeEmailVerificationToken(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashAuthToken(token) },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date()) return null;

  await prisma.emailVerificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
  return record;
}
