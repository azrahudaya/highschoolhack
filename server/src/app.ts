import compression from 'compression';
import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import helmet from 'helmet';
import morgan from 'morgan';
import { passport } from './auth/passport';
import { createSessionMiddleware } from './auth/session';
import { env } from './config/env';
import { programStages } from './data/programs';
import { errorHandler } from './middleware/error-handler';
import { authRouter } from './routes/auth';
import { adminSchoolRouter } from './routes/admin-school';
import { bekal10Router } from './routes/bekal10';
import { onboardingRouter } from './routes/onboarding';
import { protectedRouter } from './routes/protected';
import { schoolsRouter } from './routes/schools';
import { teacherBekal10Router } from './routes/teacher-bekal10';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (env.NODE_ENV === 'production') app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.NODE_ENV === 'production' ? false : env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(createSessionMiddleware());
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'HighschoolHack',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/programs', (_req, res) => {
    res.json({ programs: programStages });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminSchoolRouter);
  app.use('/api/student/programs/bekal-10', bekal10Router);
  app.use('/api/teacher/bekal-10', teacherBekal10Router);
  app.use('/api/schools', schoolsRouter);
  app.use('/api/onboarding', onboardingRouter);
  app.use('/api/protected', protectedRouter);

  app.use('/api', (_req, res) => {
    res.status(404).json({
      error: 'NotFound',
      message: 'API route tidak ditemukan.',
    });
  });

  const clientDistPath = path.resolve(__dirname, '../../client/dist');

  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get(/^\/(?!api).*/, (_req, res) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  } else {
    app.get('/', (_req, res) => {
      res.json({
        app: 'HighschoolHack API',
        message: 'Client build not found. Run npm run build to generate client/dist.',
      });
    });
  }

  app.use(errorHandler);

  return app;
}
