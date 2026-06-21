import { randomBytes } from 'node:crypto';
import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../db/prisma';

export function adminSchoolId(req: Express.Request) {
  const membership = req.user!.memberships.find((item) => item.role === UserRole.school_admin)
    ?? req.user!.memberships.find((item) => item.role === UserRole.super_admin);
  if (!membership) throw Object.assign(new Error('Admin belum terhubung ke sekolah.'), { statusCode: 403 });
  return membership.school.id;
}

export function requireSuperAdminAccess(req: Express.Request) {
  if (!req.user!.memberships.some((item) => item.role === UserRole.super_admin)) {
    throw Object.assign(new Error('Hanya super admin yang dapat menggabungkan sekolah.'), { statusCode: 403 });
  }
}

export async function recordAudit(req: Express.Request, action: string, entityType: string, entityId?: string, metadata?: Record<string, unknown>) {
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

export async function generateJoinCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = `HSH-${randomBytes(3).toString('hex').toUpperCase()}`;
    if (!(await prisma.school.findUnique({ where: { joinCode: code } }))) return code;
  }
  throw Object.assign(new Error('Gagal membuat kode sekolah baru.'), { statusCode: 503 });
}

export function gradeFromClassName(value: string) {
  const normalized = value.trim().toUpperCase();
  if (normalized.startsWith('XII') || normalized.startsWith('12')) return 12;
  if (normalized.startsWith('XI') || normalized.startsWith('11')) return 11;
  return 10;
}

type BulkStudent = {
  email: string;
  fullName: string;
  className: string;
  nisn?: string;
};

export async function importStudentsForSchool(schoolId: string, students: BulkStudent[]) {
  const imported: Array<{ email: string; status: string }> = [];
  const errors: Array<{ email: string; message: string }> = [];

  for (const student of students) {
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

  return { imported, errors };
}

export async function listCleanupSchools() {
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
  return schools.map((school) => ({
    id: school.id,
    name: school.name,
    slug: school.slug,
    classCount: school._count.classes,
    studentCount: school._count.studentProfiles,
    membershipCount: school._count.memberships,
  }));
}

export async function mergeSchools(sourceSchoolId: string, targetSchoolId: string) {
  return prisma.$transaction(async (tx) => {
    const [sourceSchool, targetSchool] = await Promise.all([
      tx.school.findUnique({ where: { id: sourceSchoolId }, include: { classes: true } }),
      tx.school.findUnique({ where: { id: targetSchoolId }, include: { classes: true } }),
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
}

export async function moveStudentToSchool(userId: string, sourceSchoolId: string, targetSchoolId: string, targetClassName?: string) {
  return prisma.$transaction(async (tx) => {
    const [sourceProfile, targetSchool] = await Promise.all([
      tx.studentProfile.findUnique({ where: { userId_schoolId: { userId, schoolId: sourceSchoolId } } }),
      tx.school.findUnique({ where: { id: targetSchoolId } }),
    ]);
    if (!sourceProfile || !targetSchool) throw Object.assign(new Error('Siswa atau sekolah tujuan tidak ditemukan.'), { statusCode: 404 });
    if (await tx.studentProfile.findUnique({ where: { userId_schoolId: { userId, schoolId: targetSchoolId } } })) {
      throw Object.assign(new Error('Siswa sudah memiliki profil di sekolah tujuan.'), { statusCode: 409 });
    }
    if (sourceProfile.nisn && await tx.studentProfile.findFirst({ where: { schoolId: targetSchoolId, nisn: sourceProfile.nisn } })) {
      throw Object.assign(new Error('NISN sudah digunakan di sekolah tujuan.'), { statusCode: 409 });
    }

    let targetClassId: string | null = null;
    if (targetClassName) {
      const targetClass = await tx.schoolClass.upsert({
        where: { schoolId_name: { schoolId: targetSchoolId, name: targetClassName } },
        update: {},
        create: { schoolId: targetSchoolId, name: targetClassName, grade: gradeFromClassName(targetClassName) },
      });
      targetClassId = targetClass.id;
    }

    const updatedProfile = await tx.studentProfile.update({
      where: { userId_schoolId: { userId, schoolId: sourceSchoolId } },
      data: { schoolId: targetSchoolId, classId: targetClassId },
    });
    await tx.schoolMembership.deleteMany({ where: { userId, schoolId: sourceSchoolId, role: UserRole.student } });
    await tx.schoolMembership.upsert({
      where: { userId_schoolId_role: { userId, schoolId: targetSchoolId, role: UserRole.student } },
      update: {},
      create: { userId, schoolId: targetSchoolId, role: UserRole.student },
    });
    await tx.programEnrollment.updateMany({ where: { userId, schoolId: sourceSchoolId }, data: { schoolId: targetSchoolId } });
    return updatedProfile;
  });
}
