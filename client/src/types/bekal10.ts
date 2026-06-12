export type ModuleStatus = 'locked' | 'not_started' | 'in_progress' | 'completed';

export type Bekal10Dashboard = {
  student: {
    name: string;
    className: string | null;
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

export type RiasecCategory = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type VarkCategory = 'V' | 'A' | 'R' | 'K';

export type Bekal10ModuleResponse = {
  module: {
    id: string;
    slug: string;
    title: string;
    order: number;
    status: ModuleStatus;
  };
  response: Record<string, unknown> | null;
  config: {
    riasec: {
      items: Array<{ id: string; category: RiasecCategory; text: string }>;
      labels: Record<RiasecCategory, string>;
      scale: Array<{ value: number; label: string }>;
    };
    vark: {
      items: Array<{
        id: string;
        text: string;
        options: Array<{ category: VarkCategory; text: string }>;
      }>;
      labels: Record<VarkCategory, string>;
    };
  } | null;
};

export type Bekal10Portfolio = {
  student: {
    userId: string;
    name: string;
    nisn: string | null;
    className: string | null;
    schoolName: string;
  };
  program: {
    title: string;
    completedCount: number;
    totalModules: number;
    progressPercentage: number;
    completed: boolean;
  };
  badges: Array<{ order: number; label: string }>;
  modules: Array<{
    id: string;
    slug: string;
    title: string;
    order: number;
    status: ModuleStatus;
    completedAt: string | null;
    data: Record<string, unknown> | null;
  }>;
};

export type TeacherBekal10Dashboard = {
  school: {
    id: string;
    name: string;
    classes: Array<{ id: string; name: string; grade: number }>;
  };
  metrics: {
    totalStudents: number;
    averageProgress: number;
    completedStudents: number;
    needsAttention: number;
  };
  distributions: {
    riasec: Record<string, number>;
    vark: Record<string, number>;
    adaptationChallenges: Record<string, number>;
    developmentAreas: Record<string, number>;
    difficultSubjects: Record<string, number>;
  };
  students: Array<{
    userId: string;
    name: string;
    nisn: string | null;
    className: string | null;
    completedCount: number;
    progressPercentage: number;
    needsAttention: boolean;
  }>;
};
