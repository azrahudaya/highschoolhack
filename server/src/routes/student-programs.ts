import { ModuleStatus, Prisma, ProgramSlug } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { cityCosts, scholarships } from '../data/smart-financial';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/async-handler';
import { requireRole } from '../middleware/auth';
import { ensureProgramEnrollment, saveModuleResponse } from '../services/bekal10';
import { createSimplePdf, currency as pdfCurrency } from '../services/simple-pdf';

const router = Router();

const autosaveSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

const supportedPrograms: Record<string, ProgramSlug> = {
  'setting-goal': ProgramSlug.setting_goal,
  'smart-financial': ProgramSlug.smart_financial,
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
      schoolName: context.membership.school.name,
    },
    program: {
      slug: context.program.slug,
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
      where: { userId: req.user!.id, module: { programId: context.program.id } },
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
      where: { userId: req.user!.id, module: { programId: context.program.id } },
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
    const reportLines = isSmartFinancial ? [
      { text: 'Laporan Future Ready Board', options: { bold: true, size: 24 } },
      { text: 'Coba dulu sebelum boncos beneran.', options: { size: 13 } },
      { text: '' },
      { text: 'Profil Simulasi', options: { bold: true, size: 15 } },
      { text: `Nama: ${context.profile.fullName}` },
      { text: `Sekolah: ${context.membership.school.name}` },
      { text: `Kelas: ${context.profile.class?.name ?? '-'}` },
      { text: `Tanggal simulasi: ${new Date().toLocaleDateString('id-ID')}` },
      { text: `Kota tujuan: ${allData.destinationCity ?? '-'}` },
      { text: `Target setelah lulus: ${allData.afterGraduationTarget ?? '-'}` },
      { text: '' },
      { text: 'Ringkasan Biaya Hidup', options: { bold: true, size: 15 } },
      { text: `Kos/tempat tinggal: ${city ? pdfCurrency(city.housing) : '-'}` },
      { text: `Makan: ${city ? pdfCurrency(city.food) : '-'}` },
      { text: `Transport: ${city ? pdfCurrency(city.transport) : '-'}` },
      { text: `Belajar/lainnya: ${city ? pdfCurrency(city.study) : '-'}` },
      { text: `Estimasi hidup hemat: ${monthlyCost ? `${pdfCurrency(monthlyCost)} / bulan` : '-'}` },
      { text: '' },
      { text: 'Hasil Akhir', options: { bold: true, size: 15 } },
      { text: `Saldo akhir: ${pdfCurrency(allData.finalBalance)}` },
      { text: `Dana darurat: ${pdfCurrency(allData.emergencyFund)}` },
      { text: `Risk score: ${allData.riskScore ?? 0}` },
      { text: `Decision score: ${allData.decisionScore ?? 0}` },
      { text: `Lives tersisa: ${allData.lives ?? '-'}` },
      { text: `Status akhir: ${allData.finalBalance && Number(allData.finalBalance) < 0 ? 'Defisit' : 'Terkendali'}` },
      { text: `Badge: ${allData.badge ?? '-'}` },
      { text: String(allData.finalDecision ?? 'Rencana perlu dicek ulang bersama Guru BK atau orang tua/wali sebelum mengambil keputusan akhir.') },
      { text: '' },
      { text: 'Rekomendasi Aksi', options: { bold: true, size: 15 } },
      { text: '- Hindari paylater untuk kebutuhan konsumtif.' },
      { text: '- Cek beasiswa, bantuan pendidikan, atau jalur vokasi yang cocok.' },
      { text: '- Buat target dana darurat minimal Rp 500.000.' },
      { text: '- Bandingkan biaya hidup antar kota sebelum menentukan tujuan.' },
      { text: '- Diskusi dengan Guru BK atau orang tua/wali soal rencana setelah lulus.' },
      { text: '' },
      { text: 'Beasiswa yang Bisa Dicek', options: { bold: true, size: 15 } },
      ...scholarships.map((item) => ({ text: `- ${item.name} (${item.type})` })),
      { text: '' },
      { text: 'Catatan edukatif: hasil ini adalah simulasi belajar, bukan penilaian pribadi. Masa depan tidak harus mahal, tapi perlu direncanakan.' },
    ] : [
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
      where: { userId_moduleId: { userId: req.user!.id, moduleId: progress.moduleId } },
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

    await saveModuleResponse(req.user!.id, progress.moduleId, payload.data as Prisma.InputJsonValue);
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

    const stored = await prisma.moduleResponse.findUnique({
      where: { userId_moduleId: { userId: req.user!.id, moduleId: progress.moduleId } },
    });

    if (!stored?.data || typeof stored.data !== 'object' || Array.isArray(stored.data)) {
      res.status(400).json({ error: 'IncompleteModule', message: 'Isi modul terlebih dahulu sebelum menyelesaikannya.' });
      return;
    }

    ensurePayloadHasContent(stored.data as Record<string, unknown>);

    await prisma.$transaction(async (transaction) => {
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
