import type { ModuleStatus } from './bekal10';

export type StudentProgramDashboard = {
  student: {
    name: string;
    className: string | null;
    grade?: number | null;
    schoolName: string;
  };
  program: {
    slug: string;
    title: string;
    description: string;
    progressPercentage: number;
    completedCount: number;
    totalModules: number;
    currentModuleSlug: string | null;
    modules: Array<{
      id: string;
      slug: string;
      title: string;
      order: number;
      status: ModuleStatus;
      completedAt: string | null;
    }>;
  };
};

export type StudentHomeDashboard = StudentProgramDashboard & {
  recommendedProgram: {
    pathSlug: 'bekal-10' | 'setting-goal' | 'smart-financial';
    title: string;
    gradeLabel: string;
    theme: string;
    accent: string;
    portfolioPath: string;
  };
};

export type StudentProgramModuleResponse = {
  module: {
    id: string;
    slug: string;
    title: string;
    order: number;
    status: ModuleStatus;
  };
  response: Record<string, unknown> | null;
  config: Record<string, unknown> | null;
};
