import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { getAuthUser } from '../auth/user';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/async-handler';
import { requireAuth } from '../middleware/auth';

const router = Router();

const studentOnboardingSchema = z.object({
  fullName: z.string().trim().min(2),
  schoolJoinCode: z.string().trim().min(3),
  classId: z.string().trim().optional(),
  nisn: z.string().trim().optional(),
});

router.post(
  '/student',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = studentOnboardingSchema.parse(req.body);
    const userId = req.user!.id;

    const school = await prisma.school.findUnique({
      where: { joinCode: payload.schoolJoinCode.toUpperCase() },
    });

    if (!school) {
      res.status(404).json({
        error: 'SchoolNotFound',
        message: 'Kode sekolah tidak ditemukan.',
      });
      return;
    }

    if (payload.classId) {
      const schoolClass = await prisma.schoolClass.findFirst({
        where: {
          id: payload.classId,
          schoolId: school.id,
        },
      });

      if (!schoolClass) {
        res.status(400).json({
          error: 'InvalidClass',
          message: 'Kelas tidak terdaftar di sekolah tersebut.',
        });
        return;
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: payload.fullName },
    });

    await prisma.schoolMembership.upsert({
      where: {
        userId_schoolId_role: {
          userId: user.id,
          schoolId: school.id,
          role: UserRole.student,
        },
      },
      update: {},
      create: {
        userId: user.id,
        schoolId: school.id,
        role: UserRole.student,
      },
    });

    const profile = await prisma.studentProfile.upsert({
      where: {
        userId_schoolId: {
          userId: user.id,
          schoolId: school.id,
        },
      },
      update: {
        fullName: payload.fullName,
        classId: payload.classId,
        nisn: payload.nisn,
      },
      create: {
        userId: user.id,
        schoolId: school.id,
        fullName: payload.fullName,
        classId: payload.classId,
        nisn: payload.nisn,
      },
      include: {
        class: true,
        school: true,
      },
    });

    res.status(201).json({
      user: await getAuthUser(user.id),
      profile,
      redirectTo: '/app',
    });
  }),
);

export const onboardingRouter = router;
