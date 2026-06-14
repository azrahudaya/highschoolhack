import { ModuleStatus, Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { riasecItems, riasecLabels, scoreRiasec, scoreVark, varkItems, varkLabels } from '../data/bekal10-assessments';
import { availableModuleSlugs, phaseOneBModuleSchemas, revisableModuleSlugs } from '../data/bekal10-modules';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/async-handler';
import { requireRole } from '../middleware/auth';
import { ensureBekal10Enrollment, saveModuleResponse } from '../services/bekal10';
import { buildStudentPortfolio } from '../services/portfolio';

const router = Router();

const autosaveSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

const moduleOneSchema = z.object({
  learningEnvironment: z.string().min(1),
  studyCompany: z.string().min(1),
  excitement: z.array(z.string()).min(1),
  challenges: z.array(z.string()).min(1),
  friendRelation: z.coerce.number().int().min(1).max(5),
  teacherRelation: z.coerce.number().int().min(1).max(5),
  improvements: z.array(z.string()).min(1),
  reflectionExperience: z.string().trim().min(10),
  reflectionChallenge: z.string().trim().min(10),
  reflectionStrategy: z.string().trim().min(10),
  targets: z.array(z.string()).min(1),
}).passthrough();

const moduleTwoSchema = z.object({
  riasecAnswers: z.record(z.string(), z.coerce.number().int().min(1).max(5)),
  varkAnswers: z.record(z.string(), z.enum(['V', 'A', 'R', 'K'])),
  reflectionFit: z.string().trim().min(10),
  favoriteActivities: z.string().trim().min(10),
  developmentWish: z.string().trim().min(10),
  selfInsight: z.string().trim().min(10),
}).passthrough();

function moduleConfig(slug: string) {
  if (slug === 'mengenal-diriku-lebih-dekat') {
    return {
      riasec: {
        items: riasecItems,
        labels: riasecLabels,
        scale: [
          { value: 1, label: 'Sangat tidak sesuai' },
          { value: 2, label: 'Tidak sesuai' },
          { value: 3, label: 'Cukup sesuai' },
          { value: 4, label: 'Sesuai' },
          { value: 5, label: 'Sangat sesuai' },
        ],
      },
      vark: {
        items: varkItems,
        labels: varkLabels,
      },
    };
  }
  return null;
}

function serializeDashboard(context: Awaited<ReturnType<typeof ensureBekal10Enrollment>>) {
  const completedCount = context.progress.filter((item) => item.status === ModuleStatus.completed).length;
  const progressPercentage = Math.round((completedCount / context.progress.length) * 100);
  const current = context.progress.find((item) => item.status === ModuleStatus.in_progress || item.status === ModuleStatus.not_started);

  return {
    student: {
      name: context.profile.fullName,
      className: context.profile.class?.name ?? null,
      schoolName: context.membership.school.name,
    },
    program: {
      slug: 'bekal-10',
      title: context.program.title,
      description: context.program.description,
      progressPercentage,
      completedCount,
      totalModules: context.progress.length,
      currentModuleSlug: current?.module.slug ?? null,
      modules: context.progress.map((item) => ({
        id: item.module.id,
        slug: item.module.slug,
        title: item.module.title,
        order: item.module.order,
        status: item.status,
        completedAt: item.completedAt,
      })),
    },
  };
}

router.use(requireRole('student'));

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const context = await ensureBekal10Enrollment(req.user!.id);
    res.json(serializeDashboard(context));
  }),
);

router.get(
  '/portfolio',
  asyncHandler(async (req, res) => {
    const context = await ensureBekal10Enrollment(req.user!.id);
    res.json(await buildStudentPortfolio(req.user!.id, context.membership.schoolId));
  }),
);

router.get(
  '/modules/:moduleSlug',
  asyncHandler(async (req, res) => {
    const moduleSlug = z.string().min(1).parse(req.params.moduleSlug);
    const context = await ensureBekal10Enrollment(req.user!.id);
    const progress = context.progress.find((item) => item.module.slug === moduleSlug);

    if (!progress) {
      res.status(404).json({ error: 'ModuleNotFound', message: 'Modul tidak ditemukan.' });
      return;
    }

    if (progress.status === ModuleStatus.locked) {
      res.status(403).json({ error: 'ModuleLocked', message: 'Selesaikan modul sebelumnya terlebih dahulu.' });
      return;
    }

    const response = await prisma.moduleResponse.findUnique({
      where: { enrollmentId_moduleId: { enrollmentId: context.enrollment.id, moduleId: progress.moduleId } },
    });

    res.json({
      module: {
        id: progress.module.id,
        slug: progress.module.slug,
        title: progress.module.title,
        order: progress.module.order,
        status: progress.status,
      },
      response: response?.data ?? null,
      config: moduleConfig(progress.module.slug),
    });
  }),
);

router.put(
  '/modules/:moduleSlug',
  asyncHandler(async (req, res) => {
    const moduleSlug = z.string().min(1).parse(req.params.moduleSlug);
    const payload = autosaveSchema.parse(req.body);
    const context = await ensureBekal10Enrollment(req.user!.id);
    const progress = context.progress.find((item) => item.module.slug === moduleSlug);

    if (!progress) {
      res.status(404).json({ error: 'ModuleNotFound', message: 'Modul tidak ditemukan.' });
      return;
    }

    if (progress.status === ModuleStatus.locked) {
      res.status(403).json({ error: 'ModuleLocked', message: 'Modul masih terkunci.' });
      return;
    }

    if (progress.status === ModuleStatus.completed && !revisableModuleSlugs.has(moduleSlug)) {
      res.status(409).json({ error: 'ModuleCompleted', message: 'Modul yang sudah selesai hanya dapat dilihat kembali.' });
      return;
    }

    if (!availableModuleSlugs.has(moduleSlug)) {
      res.status(409).json({ error: 'ModuleNotAvailable', message: 'Konten modul ini belum tersedia.' });
      return;
    }

    await saveModuleResponse(req.user!.id, context.enrollment.id, progress.moduleId, payload.data as Prisma.InputJsonValue);
    if (progress.status === ModuleStatus.not_started) {
      await prisma.moduleProgress.update({ where: { id: progress.id }, data: { status: ModuleStatus.in_progress } });
    }

    res.json({ savedAt: new Date().toISOString() });
  }),
);

router.post(
  '/modules/:moduleSlug/complete',
  asyncHandler(async (req, res) => {
    const moduleSlug = z.string().min(1).parse(req.params.moduleSlug);
    const context = await ensureBekal10Enrollment(req.user!.id);
    const progressIndex = context.progress.findIndex((item) => item.module.slug === moduleSlug);
    const progress = context.progress[progressIndex];

    if (!progress) {
      res.status(404).json({ error: 'ModuleNotFound', message: 'Modul tidak ditemukan.' });
      return;
    }

    if (progress.status === ModuleStatus.locked) {
      res.status(403).json({ error: 'ModuleLocked', message: 'Modul masih terkunci.' });
      return;
    }

    if (progress.status === ModuleStatus.completed) {
      res.json(serializeDashboard(context));
      return;
    }

    if (!availableModuleSlugs.has(moduleSlug)) {
      res.status(409).json({ error: 'ModuleNotAvailable', message: 'Konten modul ini belum tersedia.' });
      return;
    }

    const stored = await prisma.moduleResponse.findUnique({
      where: { enrollmentId_moduleId: { enrollmentId: context.enrollment.id, moduleId: progress.moduleId } },
    });
    const rawData = stored?.data;

    if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
      res.status(400).json({ error: 'IncompleteModule', message: 'Isi modul terlebih dahulu sebelum menyelesaikannya.' });
      return;
    }

    let finalData: Prisma.InputJsonValue = rawData as Prisma.InputJsonValue;

    if (moduleSlug === 'langkah-awalku-di-sma') {
      finalData = moduleOneSchema.parse(rawData) as Prisma.InputJsonValue;
    }

    if (moduleSlug === 'mengenal-diriku-lebih-dekat') {
      const parsed = moduleTwoSchema.parse(rawData);
      const allRiasecAnswered = riasecItems.every((item) => parsed.riasecAnswers[item.id] !== undefined);
      const allVarkAnswered = varkItems.every((item) => parsed.varkAnswers[item.id] !== undefined);
      if (!allRiasecAnswered || !allVarkAnswered) {
        res.status(400).json({ error: 'IncompleteAssessment', message: 'Jawab semua item RIASEC dan preferensi belajar terlebih dahulu.' });
        return;
      }
      finalData = {
        ...parsed,
        results: {
          riasec: scoreRiasec(parsed.riasecAnswers),
          vark: scoreVark(parsed.varkAnswers),
        },
      } as Prisma.InputJsonValue;
    }

    const phaseOneBSchema = phaseOneBModuleSchemas[moduleSlug];
    if (phaseOneBSchema) finalData = phaseOneBSchema.parse(rawData) as Prisma.InputJsonValue;

    await prisma.$transaction(async (transaction) => {
      await transaction.moduleResponse.upsert({
        where: { enrollmentId_moduleId: { enrollmentId: context.enrollment.id, moduleId: progress.moduleId } },
        update: { data: finalData },
        create: { userId: req.user!.id, enrollmentId: context.enrollment.id, moduleId: progress.moduleId, data: finalData },
      });
      await transaction.moduleProgress.update({
        where: { id: progress.id },
        data: { status: ModuleStatus.completed, completedAt: new Date() },
      });
      const next = context.progress[progressIndex + 1];
      if (next?.status === ModuleStatus.locked) {
        await transaction.moduleProgress.update({ where: { id: next.id }, data: { status: ModuleStatus.not_started } });
      }
    });

    const refreshed = await ensureBekal10Enrollment(req.user!.id);
    res.json(serializeDashboard(refreshed));
  }),
);

export const bekal10Router = router;
