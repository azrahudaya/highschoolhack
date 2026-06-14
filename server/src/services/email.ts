import nodemailer from 'nodemailer';
import { env } from '../config/env';

type Mail = {
  to: string;
  subject: string;
  text: string;
};

const smtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_FROM);

function createTransporter() {
  if (!smtpConfigured) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
}

export async function sendMail(mail: Mail) {
  const transporter = createTransporter();
  if (!transporter || !env.SMTP_FROM) {
    if (env.NODE_ENV !== 'production') {
      console.info('Email delivery skipped because SMTP is not configured.', { to: mail.to, subject: mail.subject });
    }
    return { queued: false };
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
  });
  return { queued: true };
}

export function buildClientUrl(path: string) {
  return new URL(path, env.CLIENT_URL).toString();
}

export async function sendPasswordResetEmail(email: string, token: string, expiresInMinutes: number) {
  const resetUrl = buildClientUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  return sendMail({
    to: email,
    subject: 'Reset password HighschoolHack',
    text: [
      'Kami menerima permintaan reset password HighschoolHack.',
      `Buka link ini dalam ${expiresInMinutes} menit: ${resetUrl}`,
      'Jika kamu tidak meminta reset password, abaikan email ini.',
    ].join('\n\n'),
  });
}

export async function sendEmailVerificationEmail(email: string, token: string, expiresInHours: number) {
  const verifyUrl = buildClientUrl(`/verify-email?token=${encodeURIComponent(token)}`);
  return sendMail({
    to: email,
    subject: 'Verifikasi email HighschoolHack',
    text: [
      'Verifikasi email akun HighschoolHack kamu.',
      `Buka link ini dalam ${expiresInHours} jam: ${verifyUrl}`,
      'Jika kamu tidak membuat akun HighschoolHack, abaikan email ini.',
    ].join('\n\n'),
  });
}
