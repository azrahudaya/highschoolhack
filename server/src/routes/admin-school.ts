import { randomBytes } from 'node:crypto';
import { Prisma, ProgramSlug, UserRole } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/async-handler';
import { requireRole } from '../middleware/auth';

const router = Router();

const schoolSchema = z.object({
  name: z.string().trim().min(3).max(160),
});

const classSchema = z.object({
  name: z.string().trim().min(1).max(80),
  grade: z.coerce.number().int().min(10).max(12),
});

const studentSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  nisn: z.string().trim().max(30).nullable().optional(),
  classId: z.string().trim().nullable().optional(),
});

const moveStudentSchoolSchema = z.object({
  targetSchoolId: z.string().trim().min(1),
  targetClassName: z.string().trim().min(1).max(80).optional(),
});

const bulkStudentSchema = z.object({
  students: z.array(z.object({
    email: z.string().trim().email(),
    fullName: z.string().trim().min(2).max(160),
    className: z.string().trim().min(1).max(80),
    nisn: z.string().trim().max(30).optional(),
  })).min(1).max(200),
});

const teacherSchema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().min(2).max(160),
});

const mergeClassSchema = z.object({
  sourceClassId: z.string().trim().min(1),
  targetClassId: z.string().trim().min(1),
}).refine((value) => value.sourceClassId !== value.targetClassId, {
  message: 'Kelas asal dan tujuan tidak boleh sama.',
  path: ['targetClassId'],
});

const mergeSchoolSchema = z.object({
  sourceSchoolId: z.string().trim().min(1),
  targetSchoolId: z.string().trim().min(1),
}).refine((value) => value.sourceSchoolId !== value.targetSchoolId, {
  message: 'Sekolah asal dan tujuan tidak boleh sama.',
  path: ['targetSchoolId'],
});

function adminSchoolId(req: Express.Request) {
  const membership = req.user!.memberships.find((item) => item.role === UserRole.school_admin)
    ?? req.user!.memberships.find((item) => item.role === UserRole.super_admin);
  if (!membership) throw Object.assign(new Error('Admin belum terhubung ke sekolah.'), { statusCode: 403 });
  return membership.school.id;
}

function requireSuperAdminAccess(req: Express.Request) {
  if (!req.user!.memberships.some((item) => item.role === UserRole.super_admin)) {
    throw Object.assign(new Error('Hanya super admin yang dapat menggabungkan sekolah.'), { statusCode: 403 });
  }
}

async function recordAudit(req: Express.Request, action: string, entityType: string, entityId?: string, metadata?: Record<string, unknown>) {
  const membership = req.user!.memberships.find((item) => item.role === UserRole.school_admin) ?? req.user!.memberships.find((item) => item.role === UserRole.super_admin);
  await prisma.auditLog.create({
    data: {
      actorUserId: req.user!.id,
      schoolId: membership?.school.id,
      action,
      entityType,
      entityId,
      metadata: metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

async function generateJoinCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = `HSH-${randomBytes(3).toString('hex').toUpperCase()}`;
    if (!(await prisma.school.findUnique({ where: { joinCode: code } }))) return code;
  }
  throw Object.assign(new Error('Gagal membuat kode sekolah baru.'), { statusCode: 503 });
}

function gradeFromClassName(value: string) {
  const normalized = value.trim().toUpperCase();
  if (normalized.startsWith('XII') || normalized.startsWith('12')) return 12;
  if (normalized.startsWith('XI') || normalized.startsWith('11')) return 11;
  return 10;
}

router.use(requireRole('school_admin', 'super_admin'));

router.get(
  '/audit-logs',
  asyncHandler(async (req, res) => {
    const schoolId = adminSchoolId(req);
    const logs = await prisma.auditLog.findMany({
      where: { schoolId },
      include: { actor: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    res.json({
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata,
        createdAt: log.createdAt,
        actorName: log.actor?.name ?? log.actor?.email ?? 'System',
      })),
    });
  }),
);

router.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const schoolId = adminSchoolId(req);
    const program = await prisma.program.findUnique({ where: { slug: ProgramSlug.bekal_10 }, select: { id: true } });
    const [school, totalStudents, totalTeachers, totalAdmins, enrollments] = await Promise.all([
      prisma.school.findUnique({ where: { id: schoolId }, include: { classes: { orderBy: [{ grade: 'asc' }, { name: 'asc' }] } } }),
      prisma.studentProfile.count({ where: { schoolId } }),
      prisma.schoolMembership.count({ where: { schoolId, role: UserRole.teacher_bk } }),
      prisma.schoolMembership.count({ where: { schoolId, role: { in: [UserRole.school_admin, UserRole.super_admin] } } }),
      program ? prisma.programEnrollment.findMany({ where: { schoolId, programId: program.id }, include: { progress: true } }) : Promise.resolve([]),
    ]);
    if (!school) throw Object.assign(new Error('Sekolah tidak ditemukan.'), { statusCode: 404 });
    const completedStudents = enrollments.filter((enrollment) => enrollment.progress.length > 0 && enrollment.progress.every((item) => item.status === 'completed')).length;

    res.json({
      school: { id: school.id, name: school.name, slug: school.slug },
      metrics: { totalClasses: school.classes.length, totalStudents, totalTeachers, totalAdmins, completedStudents },
      classes: school.classes,
    });
  }),
);

router.patch(
  '/school',
  asyncHandler(async (req, res) => {
    const payload = schoolSchema.parse(req.body);
    const school = await prisma.school.update({ where: { id: adminSchoolId(req) }, data: { name: payload.name } });
    await recordAudit(req, 'school.update', 'School', school.id, { name: payload.name });
    res.json({ school });
  }),
);

router.post(
  '/school/regenerate-join-code',
  asyncHandler(async (req, res) => {
    const school = await prisma.school.update({ where: { id: adminSchoolId(req) }, data: { joinCode: await generateJoinCode() } });
    await recordAudit(req, 'school.regenerateJoinCode', 'School', school.id);
    res.json({ school });
  }),
);

router.get(
  '/cleanup/schools',
  asyncHandler(async (req, res) => {
    requireSuperAdminAccess(req);
    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: {
            classes: true,
            studentProfiles: true,
            memberships: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({
      schools: schools.map((school) => ({
        id: school.id,
        name: school.name,
        slug: school.slug,
        classCount: school._count.classes,
        studentCount: school._count.studentProfiles,
        membershipCount: school._count.memberships,
      })),
    });
  }),
);

router.post(
  '/cleanup/schools/merge',
  asyncHandler(async (req, res) => {
    requireSuperAdminAccess(req);
    const payload = mergeSchoolSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const [sourceSchool, targetSchool] = await Promise.all([
        tx.school.findUnique({ where: { id: payload.sourceSchoolId }, include: { classes: true } }),
        tx.school.findUnique({ where: { id: payload.targetSchoolId }, include: { classes: true } }),
      ]);
      if (!sourceSchool || !targetSchool) throw Object.assign(new Error('Sekolah asal atau tujuan tidak ditemukan.'), { statusCode: 404 });

      const sourceProfiles = await tx.studentProfile.findMany({ where: { schoolId: sourceSchool.id }, select: { userId: true, nisn: true } });
      const sourceUserIds = sourceProfiles.map((profile) => profile.userId);
      const sourceNisns = sourceProfiles.map((profile) => profile.nisn).filter((nisn): nisn is string => Boolean(nisn));

      if (sourceUserIds.length && await tx.studentProfile.findFirst({ where: { schoolId: targetSchool.id, userId: { in: sourceUserIds } } })) {
        throw Object.assign(new Error('Merge dibatalkan karena ada siswa yang sudah memiliki profil di sekolah tujuan.'), { statusCode: 409 });
      }

      if (sourceNisns.length && await tx.studentProfile.findFirst({ where: { schoolId: targetSchool.id, nisn: { in: sourceNisns } } })) {
        throw Object.assign(new Error('Merge dibatalkan karena ada NISN yang sudah digunakan di sekolah tujuan.'), { statusCode: 409 });
      }

      const sourceEnrollments = await tx.programEnrollment.findMany({ where: { schoolId: sourceSchool.id }, select: { userId: true, programId: true } });
      for (const enrollment of sourceEnrollments) {
        const duplicateEnrollment = await tx.programEnrollment.findUnique({
          where: { userId_schoolId_programId: { userId: enrollment.userId, schoolId: targetSchool.id, programId: enrollment.programId } },
        });
        if (duplicateEnrollment) {
          throw Object.assign(new Error('Merge dibatalkan karena ada enrollment program duplikat di sekolah tujuan.'), { statusCode: 409 });
        }
      }

      let movedStudents = 0;
      for (const sourceClass of sourceSchool.classes) {
        let targetClass = targetSchool.classes.find((item) => item.name.toLowerCase() === sourceClass.name.toLowerCase());
        if (!targetClass) {
          targetClass = await tx.schoolClass.create({
            data: { schoolId: targetSchool.id, name: sourceClass.name, grade: sourceClass.grade },
          });
        }
        const updated = await tx.studentProfile.updateMany({
          where: { schoolId: sourceSchool.id, classId: sourceClass.id },
          data: { schoolId: targetSchool.id, classId: targetClass.id },
        });
        movedStudents += updated.count;
      }

      const withoutClass = await tx.studentProfile.updateMany({
        where: { schoolId: sourceSchool.id, classId: null },
        data: { schoolId: targetSchool.id },
      });
      movedStudents += withoutClass.count;

      const sourceMemberships = await tx.schoolMembership.findMany({ where: { schoolId: sourceSchool.id } });
      for (const membership of sourceMemberships) {
        const existingMembership = await tx.schoolMembership.findUnique({
          where: { userId_schoolId_role: { userId: membership.userId, schoolId: targetSchool.id, role: membership.role } },
        });
        if (existingMembership) {
          await tx.schoolMembership.delete({ where: { id: membership.id } });
        } else {
          await tx.schoolMembership.update({ where: { id: membership.id }, data: { schoolId: targetSchool.id } });
        }
      }

      await tx.programEnrollment.updateMany({ where: { schoolId: sourceSchool.id }, data: { schoolId: targetSchool.id } });
      await tx.schoolClass.deleteMany({ where: { schoolId: sourceSchool.id } });
      await tx.school.delete({ where: { id: sourceSchool.id } });

      return { movedStudents, sourceSchoolName: sourceSchool.name, targetSchoolName: targetSchool.name };
    });

    await recordAudit(req, 'school.merge', 'School', payload.targetSchoolId, result);
    res.json(result);
  }),
);

router.get(
  '/classes',
  asyncHandler(async (req, res) => {
    const classes = await prisma.schoolClass.findMany({
      where: { schoolId: adminSchoolId(req) },
      include: { _count: { select: { studentProfiles: true } } },
      orderBy: [{ grade: 'asc' }, { name: 'asc' }],
    });
    res.json({ classes: classes.map((item) => ({ id: item.id, name: item.name, grade: item.grade, studentCount: item._count.studentProfiles })) });
  }),
);

router.post(
  '/classes',
  asyncHandler(async (req, res) => {
    const payload = classSchema.parse(req.body);
    const schoolId = adminSchoolId(req);
    const existing = await prisma.schoolClass.findUnique({ where: { schoolId_name: { schoolId, name: payload.name } } });
    if (existing) {
      res.status(409).json({ error: 'ClassExists', message: 'Nama kelas sudah digunakan di sekolah ini.' });
      return;
    }
    const schoolClass = await prisma.schoolClass.create({ data: { schoolId, ...payload } });
    await recordAudit(req, 'class.create', 'SchoolClass', schoolClass.id, payload);
    res.status(201).json({ schoolClass });
  }),
);

router.patch(
  '/classes/:classId',
  asyncHandler(async (req, res) => {
    const classId = z.string().min(1).parse(req.params.classId);
    const payload = classSchema.parse(req.body);
    const schoolId = adminSchoolId(req);
    const schoolClass = await prisma.schoolClass.findFirst({ where: { id: classId, schoolId } });
    if (!schoolClass) throw Object.assign(new Error('Kelas tidak ditemukan.'), { statusCode: 404 });
    const duplicate = await prisma.schoolClass.findFirst({ where: { schoolId, name: payload.name, NOT: { id: classId } } });
    if (duplicate) {
      res.status(409).json({ error: 'ClassExists', message: 'Nama kelas sudah digunakan di sekolah ini.' });
      return;
    }
    const updatedClass = await prisma.schoolClass.update({ where: { id: classId }, data: payload });
    await recordAudit(req, 'class.update', 'SchoolClass', classId, payload);
    res.json({ schoolClass: updatedClass });
  }),
);

router.delete(
  '/classes/:classId',
  asyncHandler(async (req, res) => {
    const classId = z.string().min(1).parse(req.params.classId);
    const schoolId = adminSchoolId(req);
    const schoolClass = await prisma.schoolClass.findFirst({ where: { id: classId, schoolId }, include: { _count: { select: { studentProfiles: true } } } });
    if (!schoolClass) throw Object.assign(new Error('Kelas tidak ditemukan.'), { statusCode: 404 });
    if (schoolClass._count.studentProfiles > 0) {
      res.status(409).json({ error: 'ClassInUse', message: 'Pindahkan siswa dari kelas ini sebelum menghapusnya.' });
      return;
    }
    await prisma.schoolClass.delete({ where: { id: classId } });
    await recordAudit(req, 'class.delete', 'SchoolClass', classId, { name: schoolClass.name });
    res.status(204).send();
  }),
);

router.post(
  '/classes/merge',
  asyncHandler(async (req, res) => {
    const payload = mergeClassSchema.parse(req.body);
    const schoolId = adminSchoolId(req);
    const [sourceClass, targetClass] = await Promise.all([
      prisma.schoolClass.findFirst({ where: { id: payload.sourceClassId, schoolId } }),
      prisma.schoolClass.findFirst({ where: { id: payload.targetClassId, schoolId } }),
    ]);
    if (!sourceClass || !targetClass) throw Object.assign(new Error('Kelas asal atau tujuan tidak ditemukan.'), { statusCode: 404 });

    const movedStudents = await prisma.$transaction(async (tx) => {
      const update = await tx.studentProfile.updateMany({
        where: { schoolId, classId: sourceClass.id },
        data: { classId: targetClass.id },
      });
      await tx.schoolClass.delete({ where: { id: sourceClass.id } });
      return update.count;
    });

    await recordAudit(req, 'class.merge', 'SchoolClass', targetClass.id, { sourceClassId: sourceClass.id, movedStudents });
    res.json({ movedStudents, deletedClassId: sourceClass.id, targetClassId: targetClass.id });
  }),
);

router.get(
  '/students',
  asyncHandler(async (req, res) => {
    const schoolId = adminSchoolId(req);
    const search = z.string().trim().max(100).optional().parse(req.query.search);
    const classId = z.string().trim().optional().parse(req.query.classId);
    const students = await prisma.studentProfile.findMany({
      where: {
        schoolId,
        ...(classId ? { classId } : {}),
        ...(search ? { OR: [{ fullName: { contains: search, mode: 'insensitive' } }, { nisn: { contains: search } }, { user: { email: { contains: search, mode: 'insensitive' } } }] } : {}),
      },
      include: { class: true, user: { select: { email: true, createdAt: true } } },
      orderBy: { fullName: 'asc' },
    });
    res.json({
      students: students.map((student) => ({
        userId: student.userId,
        fullName: student.fullName,
        email: student.user.email,
        nisn: student.nisn,
        classId: student.classId,
        className: student.class?.name ?? null,
        joinedAt: student.createdAt,
      })),
    });
  }),
);

router.post(
  '/students/bulk-import',
  asyncHandler(async (req, res) => {
    const payload = bulkStudentSchema.parse(req.body);
    const schoolId = adminSchoolId(req);
    const imported: Array<{ email: string; status: string }> = [];
    const errors: Array<{ email: string; message: string }> = [];

    for (const student of payload.students) {
      try {
        await prisma.$transaction(async (tx) => {
          const schoolClass = await tx.schoolClass.upsert({
            where: { schoolId_name: { schoolId, name: student.className } },
            update: {},
            create: { schoolId, name: student.className, grade: gradeFromClassName(student.className) },
          });

          if (student.nisn && await tx.studentProfile.findFirst({ where: { schoolId, nisn: student.nisn } })) {
            throw new Error('NISN sudah digunakan di sekolah ini.');
          }

          const user = await tx.user.upsert({
            where: { email: student.email.toLowerCase() },
            update: { name: student.fullName },
            create: { email: student.email.toLowerCase(), name: student.fullName },
          });

          await tx.schoolMembership.upsert({
            where: { userId_schoolId_role: { userId: user.id, schoolId, role: UserRole.student } },
            update: {},
            create: { userId: user.id, schoolId, role: UserRole.student },
          });

          await tx.studentProfile.upsert({
            where: { userId_schoolId: { userId: user.id, schoolId } },
            update: { fullName: student.fullName, classId: schoolClass.id, nisn: student.nisn ?? null },
            create: { userId: user.id, schoolId, fullName: student.fullName, classId: schoolClass.id, nisn: student.nisn ?? null },
          });
        });
        imported.push({ email: student.email, status: 'imported' });
      } catch (error) {
        errors.push({ email: student.email, message: error instanceof Error ? error.message : 'Gagal import siswa.' });
      }
    }

    await recordAudit(req, 'student.bulkImport', 'StudentProfile', undefined, { imported: imported.length, errors: errors.length });
    res.status(errors.length ? 207 : 201).json({ imported, errors });
  }),
);

router.patch(
  '/students/:userId/move-school',
  asyncHandler(async (req, res) => {
    requireSuperAdminAccess(req);
    const userId = z.string().min(1).parse(req.params.userId);
    const payload = moveStudentSchoolSchema.parse(req.body);
    const sourceSchoolId = adminSchoolId(req);
    if (sourceSchoolId === payload.targetSchoolId) {
      res.status(400).json({ error: 'SameSchool', message: 'Sekolah tujuan harus berbeda.' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const [sourceProfile, targetSchool] = await Promise.all([
        tx.studentProfile.findUnique({ where: { userId_schoolId: { userId, schoolId: sourceSchoolId } } }),
        tx.school.findUnique({ where: { id: payload.targetSchoolId } }),
      ]);
      if (!sourceProfile || !targetSchool) throw Object.assign(new Error('Siswa atau sekolah tujuan tidak ditemukan.'), { statusCode: 404 });
      if (await tx.studentProfile.findUnique({ where: { userId_schoolId: { userId, schoolId: payload.targetSchoolId } } })) {
        throw Object.assign(new Error('Siswa sudah memiliki profil di sekolah tujuan.'), { statusCode: 409 });
      }
      if (sourceProfile.nisn && await tx.studentProfile.findFirst({ where: { schoolId: payload.targetSchoolId, nisn: sourceProfile.nisn } })) {
        throw Object.assign(new Error('NISN sudah digunakan di sekolah tujuan.'), { statusCode: 409 });
      }

      let targetClassId: string | null = null;
      if (payload.targetClassName) {
        const targetClass = await tx.schoolClass.upsert({
          where: { schoolId_name: { schoolId: payload.targetSchoolId, name: payload.targetClassName } },
          update: {},
          create: { schoolId: payload.targetSchoolId, name: payload.targetClassName, grade: gradeFromClassName(payload.targetClassName) },
        });
        targetClassId = targetClass.id;
      }

      const updatedProfile = await tx.studentProfile.update({
        where: { userId_schoolId: { userId, schoolId: sourceSchoolId } },
        data: { schoolId: payload.targetSchoolId, classId: targetClassId },
      });
      await tx.schoolMembership.deleteMany({ where: { userId, schoolId: sourceSchoolId, role: UserRole.student } });
      await tx.schoolMembership.upsert({
        where: { userId_schoolId_role: { userId, schoolId: payload.targetSchoolId, role: UserRole.student } },
        update: {},
        create: { userId, schoolId: payload.targetSchoolId, role: UserRole.student },
      });
      await tx.programEnrollment.updateMany({ where: { userId, schoolId: sourceSchoolId }, data: { schoolId: payload.targetSchoolId } });
      return updatedProfile;
    });

    await recordAudit(req, 'student.moveSchool', 'StudentProfile', result.id, { userId, targetSchoolId: payload.targetSchoolId });
    res.json({ student: result });
  }),
);

router.patch(
  '/students/:userId',
  asyncHandler(async (req, res) => {
    const userId = z.string().min(1).parse(req.params.userId);
    const payload = studentSchema.parse(req.body);
    const schoolId = adminSchoolId(req);
    const profile = await prisma.studentProfile.findUnique({ where: { userId_schoolId: { userId, schoolId } } });
    if (!profile) throw Object.assign(new Error('Siswa tidak ditemukan di sekolah ini.'), { statusCode: 404 });
    if (payload.classId && !(await prisma.schoolClass.findFirst({ where: { id: payload.classId, schoolId } }))) {
      res.status(400).json({ error: 'InvalidClass', message: 'Kelas tidak terdaftar di sekolah ini.' });
      return;
    }
    if (payload.nisn && await prisma.studentProfile.findFirst({ where: { schoolId, nisn: payload.nisn, NOT: { userId } } })) {
      res.status(409).json({ error: 'NisnExists', message: 'NISN sudah digunakan siswa lain di sekolah ini.' });
      return;
    }
    const updated = await prisma.studentProfile.update({
      where: { userId_schoolId: { userId, schoolId } },
      data: { fullName: payload.fullName, nisn: payload.nisn || null, classId: payload.classId || null },
      include: { class: true, user: { select: { email: true } } },
    });
    await recordAudit(req, 'student.update', 'StudentProfile', updated.id, { userId, classId: updated.classId, nisn: updated.nisn });
    res.json({ student: { userId: updated.userId, fullName: updated.fullName, email: updated.user.email, nisn: updated.nisn, classId: updated.classId, className: updated.class?.name ?? null } });
  }),
);

router.get(
  '/teachers',
  asyncHandler(async (req, res) => {
    const memberships = await prisma.schoolMembership.findMany({
      where: { schoolId: adminSchoolId(req), role: UserRole.teacher_bk },
      include: { user: { include: { teacherProfile: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ teachers: memberships.map((item) => ({ userId: item.userId, membershipId: item.id, email: item.user.email, fullName: item.user.teacherProfile?.fullName ?? item.user.name ?? item.user.email, joinedAt: item.createdAt })) });
  }),
);

router.post(
  '/teachers',
  asyncHandler(async (req, res) => {
    const payload = teacherSchema.parse(req.body);
    const schoolId = adminSchoolId(req);
    const user = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
    if (!user) {
      res.status(404).json({ error: 'UserNotFound', message: 'Akun belum tersedia. Minta Guru BK register atau login Google terlebih dahulu.' });
      return;
    }
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { name: payload.fullName } }),
      prisma.schoolMembership.upsert({
        where: { userId_schoolId_role: { userId: user.id, schoolId, role: UserRole.teacher_bk } },
        update: {},
        create: { userId: user.id, schoolId, role: UserRole.teacher_bk },
      }),
      prisma.teacherProfile.upsert({ where: { userId: user.id }, update: { fullName: payload.fullName }, create: { userId: user.id, fullName: payload.fullName } }),
    ]);
    await recordAudit(req, 'teacher.assign', 'User', user.id, { email: user.email });
    res.status(201).json({ teacher: { userId: user.id, email: user.email, fullName: payload.fullName } });
  }),
);

router.delete(
  '/teachers/:userId',
  asyncHandler(async (req, res) => {
    const userId = z.string().min(1).parse(req.params.userId);
    const schoolId = adminSchoolId(req);
    const membership = await prisma.schoolMembership.findUnique({ where: { userId_schoolId_role: { userId, schoolId, role: UserRole.teacher_bk } } });
    if (!membership) throw Object.assign(new Error('Guru BK tidak ditemukan di sekolah ini.'), { statusCode: 404 });
    await prisma.schoolMembership.delete({ where: { id: membership.id } });
    const remaining = await prisma.schoolMembership.count({ where: { userId, role: UserRole.teacher_bk } });
    if (remaining === 0) await prisma.teacherProfile.deleteMany({ where: { userId } });
    await recordAudit(req, 'teacher.revoke', 'User', userId);
    res.status(204).send();
  }),
);

export const adminSchoolRouter = router;
