import { randomBytes } from 'node:crypto';
import { ProgramSlug, UserRole } from '@prisma/client';
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

const teacherSchema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().min(2).max(160),
});

function adminSchoolId(req: Express.Request) {
  const membership = req.user!.memberships.find((item) => item.role === UserRole.school_admin)
    ?? req.user!.memberships.find((item) => item.role === UserRole.super_admin);
  if (!membership) throw Object.assign(new Error('Admin belum terhubung ke sekolah.'), { statusCode: 403 });
  return membership.school.id;
}

async function generateJoinCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = `HSH-${randomBytes(3).toString('hex').toUpperCase()}`;
    if (!(await prisma.school.findUnique({ where: { joinCode: code } }))) return code;
  }
  throw Object.assign(new Error('Gagal membuat kode sekolah baru.'), { statusCode: 503 });
}

router.use(requireRole('school_admin', 'super_admin'));

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
    res.json({ school });
  }),
);

router.post(
  '/school/regenerate-join-code',
  asyncHandler(async (req, res) => {
    const school = await prisma.school.update({ where: { id: adminSchoolId(req) }, data: { joinCode: await generateJoinCode() } });
    res.json({ school });
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
    res.status(201).json({ schoolClass: await prisma.schoolClass.create({ data: { schoolId, ...payload } }) });
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
    res.json({ schoolClass: await prisma.schoolClass.update({ where: { id: classId }, data: payload }) });
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
    res.status(204).send();
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
    res.status(204).send();
  }),
);

export const adminSchoolRouter = router;
