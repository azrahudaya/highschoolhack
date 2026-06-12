import { ModuleStatus, ProgramSlug } from '@prisma/client';
import { prisma } from '../db/prisma';

const badgeByOrder = [
  'Langkah Pertama',
  'Pengenal Diri',
  'Vision Maker',
  'Target Setter',
  'Reflector',
  'Akademik Planner',
  'Komitmen Juara',
];

function jsonObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function buildStudentPortfolio(userId: string, schoolId: string, options: { includeDrafts?: boolean } = {}) {
  const [profile, program] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { userId_schoolId: { userId, schoolId } },
      include: { class: true, school: true },
    }),
    prisma.program.findUnique({
      where: { slug: ProgramSlug.bekal_10 },
      include: { modules: { orderBy: { order: 'asc' } } },
    }),
  ]);

  if (!profile) throw Object.assign(new Error('Profil siswa tidak ditemukan di sekolah ini.'), { statusCode: 404 });
  if (!program) throw Object.assign(new Error('Program Bekal 10 belum tersedia.'), { statusCode: 503 });

  const enrollment = await prisma.programEnrollment.findUnique({
    where: { userId_schoolId_programId: { userId, schoolId, programId: program.id } },
    include: { progress: { include: { module: true }, orderBy: { module: { order: 'asc' } } } },
  });
  const responses = await prisma.moduleResponse.findMany({
    where: { userId, module: { programId: program.id } },
    include: { module: true },
  });
  const responseByModule = new Map(responses.map((response) => [response.moduleId, jsonObject(response.data)]));
  const progressByModule = new Map(enrollment?.progress.map((item) => [item.moduleId, item]));
  const completedCount = enrollment?.progress.filter((item) => item.status === ModuleStatus.completed).length ?? 0;

  return {
    student: {
      userId,
      name: profile.fullName,
      nisn: profile.nisn,
      className: profile.class?.name ?? null,
      schoolName: profile.school.name,
    },
    program: {
      title: program.title,
      completedCount,
      totalModules: program.modules.length,
      progressPercentage: Math.round((completedCount / program.modules.length) * 100),
      completed: completedCount === program.modules.length,
    },
    badges: program.modules
      .filter((module) => progressByModule.get(module.id)?.status === ModuleStatus.completed)
      .map((module) => ({ order: module.order, label: badgeByOrder[module.order - 1] })),
    modules: program.modules.map((module) => {
      const progress = progressByModule.get(module.id);
      const completed = progress?.status === ModuleStatus.completed;
      return {
        id: module.id,
        slug: module.slug,
        title: module.title,
        order: module.order,
        status: progress?.status ?? ModuleStatus.locked,
        completedAt: progress?.completedAt ?? null,
        data: completed || options.includeDrafts ? responseByModule.get(module.id) ?? null : null,
      };
    }),
  };
}
