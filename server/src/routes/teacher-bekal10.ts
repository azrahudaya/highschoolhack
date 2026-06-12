import { ModuleStatus, ProgramSlug } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/async-handler';
import { requireRole } from '../middleware/auth';
import { buildStudentPortfolio } from '../services/portfolio';

const router = Router();

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
      prisma.studentProfile.findMany({ where: { schoolId }, select: { userId: true } }),
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
    const averageProgress = allProfiles.length ? Math.round((completedTotal / (allProfiles.length * program.modules.length)) * 100) : 0;
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

    const students = profiles.map((profile) => {
      const enrollment = enrollmentByUser.get(profile.userId);
      const completedCount = enrollment?.progress.filter((item) => item.status === ModuleStatus.completed).length ?? 0;
      const progressPercentage = Math.round((completedCount / program.modules.length) * 100);
      return {
        userId: profile.userId,
        name: profile.fullName,
        nisn: profile.nisn,
        className: profile.class?.name ?? null,
        completedCount,
        progressPercentage,
        needsAttention: progressPercentage < 30 || adaptationAttention.has(profile.userId),
      };
    });

    res.json({
      school: { id: schoolId, name: school?.name ?? 'Sekolah', classes: school?.classes ?? [] },
      metrics: {
        totalStudents: allProfiles.length,
        averageProgress,
        completedStudents: enrollments.filter((item) => item.progress.filter((progress) => progress.status === ModuleStatus.completed).length === program.modules.length).length,
        needsAttention: allProfiles.filter((profile) => {
          const enrollment = enrollmentByUser.get(profile.userId);
          return (enrollment?.progress.filter((progress) => progress.status === ModuleStatus.completed).length ?? 0) / program.modules.length < 0.3 || adaptationAttention.has(profile.userId);
        }).length,
      },
      distributions: { riasec, vark, adaptationChallenges, developmentAreas, difficultSubjects },
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

export const teacherBekal10Router = router;
