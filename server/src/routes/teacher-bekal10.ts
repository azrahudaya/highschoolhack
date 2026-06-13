import { ModuleStatus, ProgramSlug } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/async-handler';
import { requireRole } from '../middleware/auth';
import { buildStudentPortfolio } from '../services/portfolio';

const router = Router();

const teacherNoteSchema = z.object({
  category: z.string().trim().min(2).max(80).default('general'),
  note: z.string().trim().min(5).max(2000),
  followUpAt: z.string().datetime().nullable().optional(),
});

function teacherSchoolId(req: Express.Request) {
  const membership = req.user!.memberships.find((item) => item.role === 'teacher_bk');
  if (!membership) throw Object.assign(new Error('Guru BK belum terhubung ke sekolah.'), { statusCode: 403 });
  return membership.school.id;
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function addCount(target: Record<string, number>, values: string[]) {
  for (const value of values) target[value] = (target[value] ?? 0) + 1;
}

router.use(requireRole('teacher_bk'));

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const schoolId = teacherSchoolId(req);
    const search = z.string().trim().max(100).optional().parse(req.query.search);
    const classId = z.string().trim().optional().parse(req.query.classId);
    const program = await prisma.program.findUnique({ where: { slug: ProgramSlug.bekal_10 }, include: { modules: true } });
    if (!program) throw Object.assign(new Error('Program Bekal 10 belum tersedia.'), { statusCode: 503 });
    const totalModules = program.modules.length;

    const [school, profiles, allProfiles] = await Promise.all([
      prisma.school.findUnique({ where: { id: schoolId }, include: { classes: { orderBy: { name: 'asc' } } } }),
      prisma.studentProfile.findMany({
        where: {
          schoolId,
          ...(classId ? { classId } : {}),
          ...(search ? { OR: [{ fullName: { contains: search, mode: 'insensitive' } }, { nisn: { contains: search } }] } : {}),
        },
        include: { class: true },
        orderBy: { fullName: 'asc' },
      }),
      prisma.studentProfile.findMany({ where: { schoolId }, include: { class: true } }),
    ]);
    const allUserIds = allProfiles.map((profile) => profile.userId);
    const [enrollments, responses] = await Promise.all([
      prisma.programEnrollment.findMany({
        where: { schoolId, programId: program.id },
        include: { progress: true },
      }),
      prisma.moduleResponse.findMany({
        where: { userId: { in: allUserIds }, module: { programId: program.id } },
        include: { module: true },
      }),
    ]);
    const enrollmentByUser = new Map(enrollments.map((enrollment) => [enrollment.userId, enrollment]));
    const completedTotal = enrollments.reduce((sum, enrollment) => sum + enrollment.progress.filter((item) => item.status === ModuleStatus.completed).length, 0);
    const averageProgress = allProfiles.length ? Math.round((completedTotal / (allProfiles.length * totalModules)) * 100) : 0;
    const riasec: Record<string, number> = {};
    const vark: Record<string, number> = {};
    const adaptationChallenges: Record<string, number> = {};
    const developmentAreas: Record<string, number> = {};
    const difficultSubjects: Record<string, number> = {};
    const adaptationAttention = new Set<string>();

    for (const response of responses) {
      const data = objectValue(response.data);
      if (response.module.slug === 'langkah-awalku-di-sma') {
        const challenges = stringArray(data.challenges);
        addCount(adaptationChallenges, challenges);
        if (challenges.length >= 3 || (typeof data.friendRelation === 'number' && data.friendRelation <= 2) || (typeof data.teacherRelation === 'number' && data.teacherRelation <= 2)) {
          adaptationAttention.add(response.userId);
        }
      }
      if (response.module.slug === 'mengenal-diriku-lebih-dekat') {
        const results = objectValue(data.results);
        const riasecResult = objectValue(results.riasec);
        const varkResult = objectValue(results.vark);
        const dominant = Array.isArray(riasecResult.dominant) ? objectValue(riasecResult.dominant[0]) : {};
        const varkDominant = objectValue(varkResult.dominant);
        if (typeof dominant.label === 'string') addCount(riasec, [dominant.label]);
        if (typeof varkDominant.label === 'string') addCount(vark, [varkDominant.label]);
      }
      if (response.module.slug === 'target-pengembangan-diri') addCount(developmentAreas, stringArray(data.developmentAreas));
      if (response.module.slug === 'merancang-target-prestasi') addCount(difficultSubjects, stringArray(data.difficultSubjects));
    }

    function studentProgress(userId: string) {
      const enrollment = enrollmentByUser.get(userId);
      const completedCount = enrollment?.progress.filter((item) => item.status === ModuleStatus.completed).length ?? 0;
      const progressPercentage = Math.round((completedCount / totalModules) * 100);
      return { completedCount, progressPercentage };
    }

    function attentionReasons(userId: string, progressPercentage: number) {
      const reasons: string[] = [];
      if (progressPercentage < 30) reasons.push('Progress Bekal 10 masih di bawah 30%.');
      if (adaptationAttention.has(userId)) reasons.push('Jawaban adaptasi menunjukkan tantangan relasi atau adaptasi yang perlu ditindaklanjuti.');
      return reasons;
    }

    const classGroups = new Map<string, { classId: string | null; className: string; total: number; progressTotal: number; completed: number }>();
    for (const profile of allProfiles) {
      const key = profile.classId ?? 'no-class';
      const current = classGroups.get(key) ?? { classId: profile.classId, className: profile.class?.name ?? 'Tanpa kelas', total: 0, progressTotal: 0, completed: 0 };
      const progress = studentProgress(profile.userId);
      current.total += 1;
      current.progressTotal += progress.progressPercentage;
      if (progress.completedCount === totalModules) current.completed += 1;
      classGroups.set(key, current);
    }

    const classSummaries = Array.from(classGroups.values())
      .map((item) => ({
        classId: item.classId,
        className: item.className,
        totalStudents: item.total,
        averageProgress: item.total ? Math.round(item.progressTotal / item.total) : 0,
        completionRate: item.total ? Math.round((item.completed / item.total) * 100) : 0,
      }))
      .sort((left, right) => left.className.localeCompare(right.className));

    const students = profiles.map((profile) => {
      const { completedCount, progressPercentage } = studentProgress(profile.userId);
      const reasons = attentionReasons(profile.userId, progressPercentage);
      return {
        userId: profile.userId,
        name: profile.fullName,
        nisn: profile.nisn,
        className: profile.class?.name ?? null,
        completedCount,
        progressPercentage,
        needsAttention: reasons.length > 0,
        attentionReasons: reasons,
      };
    });

    res.json({
      school: { id: schoolId, name: school?.name ?? 'Sekolah', classes: school?.classes ?? [] },
      metrics: {
        totalStudents: allProfiles.length,
        averageProgress,
        completedStudents: enrollments.filter((item) => item.progress.filter((progress) => progress.status === ModuleStatus.completed).length === totalModules).length,
        needsAttention: allProfiles.filter((profile) => attentionReasons(profile.userId, studentProgress(profile.userId).progressPercentage).length > 0).length,
      },
      distributions: { riasec, vark, adaptationChallenges, developmentAreas, difficultSubjects },
      classSummaries,
      students,
    });
  }),
);

router.get(
  '/students/:userId',
  asyncHandler(async (req, res) => {
    const userId = z.string().min(1).parse(req.params.userId);
    res.json(await buildStudentPortfolio(userId, teacherSchoolId(req), { includeDrafts: true }));
  }),
);

router.get(
  '/students/:userId/notes',
  asyncHandler(async (req, res) => {
    const userId = z.string().min(1).parse(req.params.userId);
    const schoolId = teacherSchoolId(req);
    const profile = await prisma.studentProfile.findUnique({ where: { userId_schoolId: { userId, schoolId } } });
    if (!profile) throw Object.assign(new Error('Siswa tidak ditemukan di sekolah ini.'), { statusCode: 404 });

    const notes = await prisma.teacherNote.findMany({
      where: { schoolId, studentUserId: userId },
      include: { teacher: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      notes: notes.map((note) => ({
        id: note.id,
        category: note.category,
        note: note.note,
        followUpAt: note.followUpAt,
        createdAt: note.createdAt,
        teacherName: note.teacher.name ?? note.teacher.email,
      })),
    });
  }),
);

router.post(
  '/students/:userId/notes',
  asyncHandler(async (req, res) => {
    const userId = z.string().min(1).parse(req.params.userId);
    const payload = teacherNoteSchema.parse(req.body);
    const schoolId = teacherSchoolId(req);
    const profile = await prisma.studentProfile.findUnique({ where: { userId_schoolId: { userId, schoolId } } });
    if (!profile) throw Object.assign(new Error('Siswa tidak ditemukan di sekolah ini.'), { statusCode: 404 });

    const note = await prisma.teacherNote.create({
      data: {
        schoolId,
        studentUserId: userId,
        teacherUserId: req.user!.id,
        category: payload.category,
        note: payload.note,
        followUpAt: payload.followUpAt ? new Date(payload.followUpAt) : null,
      },
    });
    res.status(201).json({ note });
  }),
);

export const teacherBekal10Router = router;
