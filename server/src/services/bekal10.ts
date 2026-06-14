import { ModuleStatus, Prisma, ProgramSlug } from '@prisma/client';
import { prisma } from '../db/prisma';

export async function getStudentContext(userId: string) {
  const membership = await prisma.schoolMembership.findFirst({
    where: { userId, role: 'student' },
    include: { school: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!membership) throw Object.assign(new Error('Profil siswa belum terhubung ke sekolah.'), { statusCode: 400 });

  const profile = await prisma.studentProfile.findUnique({
    where: { userId_schoolId: { userId, schoolId: membership.schoolId } },
    include: { class: true },
  });

  if (!profile) throw Object.assign(new Error('Profil siswa belum lengkap.'), { statusCode: 400 });

  return { membership, profile };
}

export async function ensureBekal10Enrollment(userId: string) {
  return ensureProgramEnrollment(userId, ProgramSlug.bekal_10);
}

export async function ensureProgramEnrollment(userId: string, slug: ProgramSlug) {
  const { membership, profile } = await getStudentContext(userId);
  const program = await prisma.program.findUnique({
    where: { slug },
    include: { modules: { orderBy: { order: 'asc' } } },
  });

  if (!program) throw Object.assign(new Error('Program belum tersedia. Jalankan seed database.'), { statusCode: 503 });

  const enrollment = await prisma.programEnrollment.upsert({
    where: { userId_schoolId_programId: { userId, schoolId: membership.schoolId, programId: program.id } },
    update: {},
    create: { userId, schoolId: membership.schoolId, programId: program.id },
  });

  const existing = await prisma.moduleProgress.findMany({ where: { enrollmentId: enrollment.id } });
  const existingModuleIds = new Set(existing.map((item) => item.moduleId));
  const missing = program.modules.filter((module) => !existingModuleIds.has(module.id));

  if (missing.length) {
    await prisma.$transaction(
      missing.map((module) =>
        prisma.moduleProgress.create({
          data: {
            enrollmentId: enrollment.id,
            moduleId: module.id,
            status: module.order === 1 ? ModuleStatus.not_started : ModuleStatus.locked,
          },
        }),
      ),
    );
  }

  const progress = await prisma.moduleProgress.findMany({
    where: { enrollmentId: enrollment.id },
    include: { module: true },
    orderBy: { module: { order: 'asc' } },
  });

  return { membership, profile, program, enrollment, progress };
}

export async function saveModuleResponse(userId: string, enrollmentId: string, moduleId: string, data: Prisma.InputJsonValue) {
  return prisma.moduleResponse.upsert({
    where: { enrollmentId_moduleId: { enrollmentId, moduleId } },
    update: { data },
    create: { userId, enrollmentId, moduleId, data },
  });
}
