import { ModuleStatus, Prisma, ProgramSlug } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { cityCosts, scholarships } from '../data/smart-financial';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/async-handler';
import { requireRole } from '../middleware/auth';
import { ensureProgramEnrollment, getStudentContext, saveModuleResponse } from '../services/bekal10';
import { createFutureReadyBoardPdf } from '../services/future-ready-pdf';
import { createSimplePdf } from '../services/simple-pdf';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const router = Router();

const autosaveSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

const supportedPrograms: Record<string, ProgramSlug> = {
  'setting-goal': ProgramSlug.setting_goal,
  'smart-financial': ProgramSlug.smart_financial,
};

const programMeta = {
  [ProgramSlug.bekal_10]: {
    pathSlug: 'bekal-10',
    title: 'Bekal 10',
    gradeLabel: 'Kelas X',
    theme: 'Adaptasi SMA, potensi diri, target akademik, dan portofolio awal.',
    accent: '#5b21b6',
    portfolioPath: '/app/portfolio',
  },
  [ProgramSlug.setting_goal]: {
    pathSlug: 'setting-goal',
    title: 'Setting Goal',
    gradeLabel: 'Kelas XI',
    theme: 'Rancang pilihan jurusan, karier, dan langkah nyata sejak kelas XI.',
    accent: '#087f5b',
    portfolioPath: '/app/programs/setting-goal/portfolio',
  },
  [ProgramSlug.smart_financial]: {
    pathSlug: 'smart-financial',
    title: 'Smart Financial',
    gradeLabel: 'Kelas XII',
    theme: 'Latih keputusan finansial sebelum hidup mandiri setelah lulus.',
    accent: '#b45309',
    portfolioPath: '/app/programs/smart-financial/portfolio',
  },
} as const;

function pathSlugForProgram(slug: ProgramSlug) {
  return programMeta[slug].pathSlug;
}

function recommendedProgramForGrade(grade: number | null | undefined) {
  if (grade === 12) return ProgramSlug.smart_financial;
  if (grade === 11) return ProgramSlug.setting_goal;
  return ProgramSlug.bekal_10;
}

const requiredText = z.string().trim().min(10);
const requiredShortText = z.string().trim().min(2);
const requiredStringArray = z.array(z.string().trim().min(1)).min(1);
const requiredNumber = z.preprocess((value) => value === '' ? undefined : value, z.coerce.number().min(0));
const requiredRange = (min: number, max: number) => z.preprocess((value) => value === '' ? undefined : value, z.coerce.number().min(min).max(max));
const requiredSimulationStepIds = ['target', 'housing', 'food', 'transport', 'study-tools', 'laundry', 'phone', 'community', 'emergency', 'side-income', 'review', 'ready'];
const requiredSimulationDecisions = z.record(z.string(), z.string()).refine(
  (value) => requiredSimulationStepIds.every((stepId) => typeof value[stepId] === 'string' && value[stepId].trim().length > 0),
  { message: 'Pilih satu keputusan pada semua 12 langkah simulasi.' },
);

const moduleCompletionSchemas: Record<string, Record<string, z.ZodTypeAny>> = {
  'setting-goal': {
    'kenali-diriku': z.object({
      strengths: requiredStringArray,
      values: requiredStringArray,
      selfNarrative: requiredText,
    }).passthrough(),
    'eksplorasi-program-studi': z.object({
      studyPrograms: requiredStringArray,
      programReason: requiredText,
      proofToFind: requiredText,
    }).passthrough(),
    'eksplorasi-karier': z.object({
      careerOptions: requiredStringArray,
      careerActivities: requiredText,
      skillsNeeded: requiredStringArray,
    }).passthrough(),
    'mata-pelajaran-pendukung': z.object({
      supportSubjects: requiredStringArray,
      currentGap: requiredText,
      supportPlan: requiredText,
    }).passthrough(),
    'goal-setting': z.object({
      smartSpecific: requiredText,
      smartMeasurable: requiredText,
      smartDeadline: requiredShortText,
      goalConfidence: requiredRange(1, 5),
    }).passthrough(),
    'rencana-aksi': z.object({
      priorityOne: requiredText,
      priorityTwo: requiredText,
      calendarPlan: requiredText,
    }).passthrough(),
    'dashboard-perkembangan': z.object({
      progress: requiredRange(0, 100),
      blockers: requiredStringArray,
      nextCheckpoint: requiredShortText,
    }).passthrough(),
    refleksi: z.object({
      bestInsight: requiredText,
      decision: requiredText,
      supportNeeded: requiredText,
    }).passthrough(),
  },
  'smart-financial': {
    'identitas-dan-target': z.object({
      afterGraduationTarget: requiredShortText,
      monthlyAllowance: requiredNumber,
      currentSavings: requiredNumber,
      emergencyFund: requiredNumber,
      financialConcern: requiredText,
    }).passthrough(),
    'pilih-kota-tujuan': z.object({
      destinationCity: requiredShortText,
      livingStrategy: requiredShortText,
      costNotes: requiredText,
    }).passthrough(),
    'simulasi-financial-readiness': z.object({
      monthlySavingPlan: requiredNumber,
      simulationDecisions: requiredSimulationDecisions,
      simulationReflection: requiredText,
    }).passthrough(),
    'hasil-dan-rekomendasi': z.object({
      academicRecommendation: requiredText,
      careerRecommendation: requiredText,
      financialRecommendation: requiredText,
      socialRecommendation: requiredText,
    }).passthrough(),
  },
};

function resolveProgramSlug(value: string) {
  const slug = supportedPrograms[value];
  if (!slug) throw Object.assign(new Error('Program tidak tersedia.'), { statusCode: 404 });
  return slug;
}

function serializeDashboard(context: Awaited<ReturnType<typeof ensureProgramEnrollment>>) {
  const completedCount = context.progress.filter((item) => item.status === ModuleStatus.completed).length;
  const progressPercentage = Math.round((completedCount / context.progress.length) * 100);
  const current = context.progress.find((item) => item.status === ModuleStatus.in_progress || item.status === ModuleStatus.not_started);

  return {
    student: {
      name: context.profile.fullName,
      className: context.profile.class?.name ?? null,
      grade: context.profile.class?.grade ?? null,
      schoolName: context.membership.school.name,
    },
    program: {
      slug: pathSlugForProgram(context.program.slug),
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

function serializeHomeDashboard(context: Awaited<ReturnType<typeof ensureProgramEnrollment>>) {
  return {
    ...serializeDashboard(context),
    recommendedProgram: programMeta[context.program.slug],
  };
}

function ensurePayloadHasContent(data: Record<string, unknown>) {
  const hasContent = Object.values(data).some((value) => {
    if (typeof value === 'string') return value.trim().length >= 2;
    if (typeof value === 'number') return true;
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Object.keys(value).length > 0;
    return false;
  });
  if (!hasContent) throw Object.assign(new Error('Isi modul terlebih dahulu sebelum menyelesaikannya.'), { statusCode: 400 });
}

function validateModuleCompletion(programSlug: string, moduleSlug: string, data: Record<string, unknown>) {
  const schema = moduleCompletionSchemas[programSlug]?.[moduleSlug];
  if (schema) return schema.parse(data) as Prisma.InputJsonValue;
  ensurePayloadHasContent(data);
  return data as Prisma.InputJsonValue;
}

function formatPdfValue(value: unknown) {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return JSON.stringify(value);
  return '-';
}

router.use(requireRole('student'));

router.get('/smart-financial/cities', (_req, res) => {
  res.json({ cities: cityCosts, scholarships });
});

router.get(
  '/home',
  asyncHandler(async (req, res) => {
    const { profile } = await getStudentContext(req.user!.id);
    const context = await ensureProgramEnrollment(req.user!.id, recommendedProgramForGrade(profile.class?.grade));
    res.json(serializeHomeDashboard(context));
  }),
);

router.get(
  '/:programSlug',
  asyncHandler(async (req, res) => {
    const programSlug = z.string().min(1).parse(req.params.programSlug);
    const context = await ensureProgramEnrollment(req.user!.id, resolveProgramSlug(programSlug));
    res.json(serializeDashboard(context));
  }),
);

router.get(
  '/:programSlug/portfolio',
  asyncHandler(async (req, res) => {
    const programSlug = z.string().min(1).parse(req.params.programSlug);
    const context = await ensureProgramEnrollment(req.user!.id, resolveProgramSlug(programSlug));
    const responses = await prisma.moduleResponse.findMany({
      where: { enrollmentId: context.enrollment.id },
      include: { module: true },
    });
    const responseByModuleId = new Map(responses.map((response) => [response.moduleId, response]));
    res.json({
      student: {
        userId: req.user!.id,
        name: context.profile.fullName,
        nisn: context.profile.nisn,
        className: context.profile.class?.name ?? null,
        schoolName: context.membership.school.name,
      },
      program: {
        title: context.program.title,
        completedCount: context.progress.filter((item) => item.status === ModuleStatus.completed).length,
        totalModules: context.progress.length,
      },
      modules: context.progress.map((item) => ({
        id: item.module.id,
        slug: item.module.slug,
        title: item.module.title,
        order: item.module.order,
        status: item.status,
        data: responseByModuleId.get(item.moduleId)?.data ?? null,
      })),
    });
  }),
);

router.get(
  '/:programSlug/portfolio.pdf',
  asyncHandler(async (req, res) => {
    const programSlug = z.string().min(1).parse(req.params.programSlug);
    const context = await ensureProgramEnrollment(req.user!.id, resolveProgramSlug(programSlug));
    const responses = await prisma.moduleResponse.findMany({
      where: { enrollmentId: context.enrollment.id },
      include: { module: true },
    });
    const modules = context.progress.map((item) => ({
      slug: item.module.slug,
      title: item.module.title,
      data: responses.find((response) => response.moduleId === item.moduleId)?.data as Record<string, unknown> | null,
    }));
    const allData = Object.assign({}, ...modules.map((module) => module.data ?? {}));
    const city = cityCosts.find((item) => item.city === String(allData.destinationCity ?? ''));
    const monthlyCost = city ? city.housing + city.food + city.transport + city.study : 0;
    const isSmartFinancial = programSlug === 'smart-financial';

    if (isSmartFinancial) {
      const portfolioUrl = new URL('/app/programs/smart-financial/portfolio', env.CLIENT_URL).toString();
      const pdf = await createFutureReadyBoardPdf({
        student: {
          name: context.profile.fullName,
          nisn: context.profile.nisn,
          schoolName: context.membership.school.name,
          className: context.profile.class?.name ?? null,
        },
        generatedAt: new Date(),
        data: allData,
        city,
        monthlyCost,
        scholarships,
        portfolioUrl,
      });
      logger.info('studentProgram.pdfExported', { userId: req.user!.id, programSlug, schoolId: context.membership.schoolId, bytes: pdf.length });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="future-ready-board-portfolio.pdf"');
      res.send(pdf);
      return;
    }

    const reportLines = [
      { text: `${context.program.title} Portfolio`, options: { bold: true, size: 24 } },
      { text: 'Ringkasan progres program siswa.', options: { size: 13 } },
      { text: '' },
      { text: 'Profil Siswa', options: { bold: true, size: 15 } },
      { text: `Nama: ${context.profile.fullName}` },
      { text: `Sekolah: ${context.membership.school.name}` },
      { text: `Kelas: ${context.profile.class?.name ?? '-'}` },
      { text: `Tanggal unduh: ${new Date().toLocaleDateString('id-ID')}` },
      { text: '' },
      { text: 'Ringkasan Modul', options: { bold: true, size: 15 } },
      ...modules.flatMap((module) => {
        const entries = Object.entries(module.data ?? {});
        if (!entries.length) return [{ text: `${module.title}: belum diisi.` }];
        return [
          { text: module.title, options: { bold: true, size: 12 } },
          ...entries.slice(0, 4).map(([key, value]) => ({ text: `- ${key.replace(/([A-Z])/g, ' $1')}: ${formatPdfValue(value)}` })),
        ];
      }),
      { text: '' },
      { text: 'Catatan edukatif: portfolio ini adalah ringkasan pembelajaran siswa dan sebaiknya dibahas bersama Guru BK atau orang tua/wali.' },
    ];
    const pdf = createSimplePdf(reportLines);
    logger.info('studentProgram.pdfExported', { userId: req.user!.id, programSlug, schoolId: context.membership.schoolId, bytes: pdf.length });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${programSlug}-portfolio.pdf"`);
    res.send(pdf);
  }),
);

router.get(
  '/:programSlug/modules/:moduleSlug',
  asyncHandler(async (req, res) => {
    const programSlug = z.string().min(1).parse(req.params.programSlug);
    const moduleSlug = z.string().min(1).parse(req.params.moduleSlug);
    const context = await ensureProgramEnrollment(req.user!.id, resolveProgramSlug(programSlug));
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
      config: programSlug === 'smart-financial' ? { cities: cityCosts, scholarships } : null,
    });
  }),
);

router.put(
  '/:programSlug/modules/:moduleSlug',
  asyncHandler(async (req, res) => {
    const programSlug = z.string().min(1).parse(req.params.programSlug);
    const moduleSlug = z.string().min(1).parse(req.params.moduleSlug);
    const payload = autosaveSchema.parse(req.body);
    const context = await ensureProgramEnrollment(req.user!.id, resolveProgramSlug(programSlug));
    const progress = context.progress.find((item) => item.module.slug === moduleSlug);

    if (!progress) {
      res.status(404).json({ error: 'ModuleNotFound', message: 'Modul tidak ditemukan.' });
      return;
    }

    if (progress.status === ModuleStatus.locked) {
      res.status(403).json({ error: 'ModuleLocked', message: 'Modul masih terkunci.' });
      return;
    }

    if (progress.status === ModuleStatus.completed) {
      res.status(409).json({ error: 'ModuleCompleted', message: 'Modul yang sudah selesai hanya dapat dilihat kembali.' });
      return;
    }

    await saveModuleResponse(req.user!.id, context.enrollment.id, progress.moduleId, payload.data as Prisma.InputJsonValue);
    logger.info('studentProgram.moduleSaved', {
      userId: req.user!.id,
      schoolId: context.membership.schoolId,
      programSlug,
      moduleSlug,
    });
    if (progress.status === ModuleStatus.not_started) {
      await prisma.moduleProgress.update({ where: { id: progress.id }, data: { status: ModuleStatus.in_progress } });
    }

    res.json({ savedAt: new Date().toISOString() });
  }),
);

router.post(
  '/:programSlug/modules/:moduleSlug/complete',
  asyncHandler(async (req, res) => {
    const programSlug = z.string().min(1).parse(req.params.programSlug);
    const moduleSlug = z.string().min(1).parse(req.params.moduleSlug);
    const context = await ensureProgramEnrollment(req.user!.id, resolveProgramSlug(programSlug));
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

    const stored = await prisma.moduleResponse.findUnique({
      where: { enrollmentId_moduleId: { enrollmentId: context.enrollment.id, moduleId: progress.moduleId } },
    });

    if (!stored?.data || typeof stored.data !== 'object' || Array.isArray(stored.data)) {
      res.status(400).json({ error: 'IncompleteModule', message: 'Isi modul terlebih dahulu sebelum menyelesaikannya.' });
      return;
    }

    const finalData = validateModuleCompletion(programSlug, moduleSlug, stored.data as Record<string, unknown>);

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

    const refreshed = await ensureProgramEnrollment(req.user!.id, resolveProgramSlug(programSlug));
    res.json(serializeDashboard(refreshed));
  }),
);

export const studentProgramsRouter = router;
