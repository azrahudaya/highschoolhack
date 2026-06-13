import { ModuleStatus } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/async-handler';
import { requireRole } from '../middleware/auth';

const router = Router();

function teacherSchoolId(req: Express.Request) {
  const membership = req.user!.memberships.find((item) => item.role === 'teacher_bk');
  if (!membership) throw Object.assign(new Error('Guru BK belum terhubung ke sekolah.'), { statusCode: 403 });
  return membership.school.id;
}

router.use(requireRole('teacher_bk'));

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const schoolId = teacherSchoolId(req);
    const programs = await prisma.program.findMany({
      include: {
        modules: true,
        enrollments: {
          where: { schoolId },
          include: { progress: true },
        },
      },
      orderBy: { grade: 'asc' },
    });

    res.json({
      programs: programs.map((program) => {
        const totalModules = program.modules.length || 1;
        const totalStudents = program.enrollments.length;
        const completedCounts = program.enrollments.map((enrollment) => enrollment.progress.filter((progress) => progress.status === ModuleStatus.completed).length);
        const averageProgress = totalStudents ? Math.round((completedCounts.reduce((sum, count) => sum + count, 0) / (totalStudents * totalModules)) * 100) : 0;
        const completedStudents = completedCounts.filter((count) => count === totalModules).length;
        return {
          slug: program.slug,
          title: program.title,
          grade: program.grade,
          totalStudents,
          averageProgress,
          completedStudents,
        };
      }),
    });
  }),
);

export const teacherProgramsRouter = router;
