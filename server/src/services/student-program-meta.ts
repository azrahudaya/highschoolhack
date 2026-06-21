import { ProgramSlug } from '@prisma/client';

const supportedPrograms: Record<string, ProgramSlug> = {
  'setting-goal': ProgramSlug.setting_goal,
  'smart-financial': ProgramSlug.smart_financial,
};

export const programMeta = {
  [ProgramSlug.bekal_10]: {
    pathSlug: 'bekal-10',
    title: 'Bekal 10',
    gradeLabel: 'Kelas X',
    theme: 'Adaptasi SMA, potensi diri, target akademik, dan portofolio awal.',
    accent: '#5b21b6',
    portfolioPath: '/app/portfolio',
  },
  [ProgramSlug.setting_goal]: {
    pathSlug: 'setting-goal',
    title: 'Setting Goal',
    gradeLabel: 'Kelas XI',
    theme: 'Rancang pilihan jurusan, karier, dan langkah nyata sejak kelas XI.',
    accent: '#087f5b',
    portfolioPath: '/app/programs/setting-goal/portfolio',
  },
  [ProgramSlug.smart_financial]: {
    pathSlug: 'smart-financial',
    title: 'Smart Financial',
    gradeLabel: 'Kelas XII',
    theme: 'Latih keputusan finansial sebelum hidup mandiri setelah lulus.',
    accent: '#b45309',
    portfolioPath: '/app/programs/smart-financial/portfolio',
  },
} as const;

export function pathSlugForProgram(slug: ProgramSlug) {
  return programMeta[slug].pathSlug;
}

export function recommendedProgramForGrade(grade: number | null | undefined) {
  if (grade === 12) return ProgramSlug.smart_financial;
  if (grade === 11) return ProgramSlug.setting_goal;
  return ProgramSlug.bekal_10;
}

export function resolveProgramSlug(value: string) {
  const slug = supportedPrograms[value];
  if (!slug) throw Object.assign(new Error('Program tidak tersedia.'), { statusCode: 404 });
  return slug;
}
