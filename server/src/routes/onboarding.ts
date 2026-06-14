import { randomBytes } from 'node:crypto';
import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { getAuthUser } from '../auth/user';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/async-handler';
import { requireAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

const studentOnboardingSchema = z.object({
  fullName: z.string().trim().min(2),
  schoolName: z.string().trim().min(2).max(160).optional().transform((value) => value || undefined),
  schoolId: z.string().trim().optional().transform((value) => value || undefined),
  schoolJoinCode: z.string().trim().optional().transform((value) => value || undefined),
  className: z.string().trim().max(80).optional().transform((value) => value || undefined),
  classId: z.string().trim().optional().transform((value) => value || undefined),
  nisn: z.string().trim().optional().transform((value) => value || undefined),
}).refine((value) => value.schoolName || value.schoolId || value.schoolJoinCode, {
  message: 'Nama sekolah wajib diisi.',
  path: ['schoolName'],
});

function slugifySchoolName(value: string) {
  const slug = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return slug || 'sekolah';
}

function gradeFromClassName(value: string) {
  const normalized = value.trim().toUpperCase();
  if (normalized.startsWith('XII') || normalized.startsWith('12')) return 12;
  if (normalized.startsWith('XI') || normalized.startsWith('11')) return 11;
  return 10;
}

async function generateJoinCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = `HSH-${randomBytes(3).toString('hex').toUpperCase()}`;
    if (!(await prisma.school.findUnique({ where: { joinCode: code } }))) return code;
  }
  throw Object.assign(new Error('Gagal membuat identitas sekolah.'), { statusCode: 503 });
}

async function generateSchoolSlug(name: string) {
  const base = slugifySchoolName(name);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
    if (!(await prisma.school.findUnique({ where: { slug } }))) return slug;
  }

  throw Object.assign(new Error('Gagal membuat slug sekolah.'), { statusCode: 503 });
}

async function findOrCreateSchool(payload: z.infer<typeof studentOnboardingSchema>) {
  if (payload.schoolId) {
    return prisma.school.findUnique({ where: { id: payload.schoolId } });
  }

  if (payload.schoolJoinCode) {
    return prisma.school.findUnique({ where: { joinCode: payload.schoolJoinCode.toUpperCase() } });
  }

  const existingSchool = await prisma.school.findFirst({
    where: { name: { equals: payload.schoolName!, mode: 'insensitive' } },
    orderBy: { createdAt: 'asc' },
  });

  if (existingSchool) return existingSchool;

  return prisma.school.create({
    data: {
      name: payload.schoolName!,
      slug: await generateSchoolSlug(payload.schoolName!),
      joinCode: await generateJoinCode(),
    },
  });
}

async function findOrCreateClass(schoolId: string, className?: string) {
  if (!className) return undefined;

  const existingClass = await prisma.schoolClass.findFirst({
    where: {
      schoolId,
      name: { equals: className, mode: 'insensitive' },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (existingClass) return existingClass;

  return prisma.schoolClass.create({
    data: {
      schoolId,
      name: className,
      grade: gradeFromClassName(className),
    },
  });
}

router.post(
  '/student',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = studentOnboardingSchema.parse(req.body);
    const userId = req.user!.id;

    const school = await findOrCreateSchool(payload);

    if (!school) {
      res.status(404).json({
        error: 'SchoolNotFound',
        message: 'Sekolah tidak ditemukan.',
      });
      return;
    }

    let resolvedClassId = payload.classId;

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

    if (!resolvedClassId && payload.className) {
      const schoolClass = await findOrCreateClass(school.id, payload.className);
      resolvedClassId = schoolClass?.id;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: payload.fullName },
    });

    if (payload.nisn) {
      const existingNisn = await prisma.studentProfile.findFirst({
        where: {
          schoolId: school.id,
          nisn: payload.nisn,
          NOT: { userId: user.id },
        },
      });

      if (existingNisn) {
        res.status(409).json({
          error: 'NisnExists',
          message: 'NISN sudah digunakan siswa lain di sekolah ini.',
        });
        return;
      }
    }

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
        classId: resolvedClassId,
        nisn: payload.nisn ?? null,
      },
      create: {
        userId: user.id,
        schoolId: school.id,
        fullName: payload.fullName,
        classId: resolvedClassId,
        nisn: payload.nisn ?? null,
      },
      include: {
        class: true,
        school: true,
      },
    });

    logger.info('onboarding.studentCompleted', {
      userId: user.id,
      schoolId: school.id,
      classId: resolvedClassId,
      createdSchoolByName: Boolean(payload.schoolName),
    });

    res.status(201).json({
      user: await getAuthUser(user.id),
      profile,
      redirectTo: '/app',
    });
  }),
);

export const onboardingRouter = router;
