export type AdminClass = {
  id: string;
  name: string;
  grade: number;
  studentCount: number;
};

export type AdminOverview = {
  school: { id: string; name: string; slug: string };
  metrics: {
    totalClasses: number;
    totalStudents: number;
    totalTeachers: number;
    totalAdmins: number;
    completedStudents: number;
  };
  classes: Array<{ id: string; name: string; grade: number }>;
};

export type AdminStudent = {
  userId: string;
  fullName: string;
  email: string;
  nisn: string | null;
  classId: string | null;
  className: string | null;
  joinedAt: string;
};

export type AdminTeacher = {
  userId: string;
  membershipId: string;
  email: string;
  fullName: string;
  joinedAt: string;
};

export type AdminSchoolCleanupOption = {
  id: string;
  name: string;
  slug: string;
  classCount: number;
  studentCount: number;
  membershipCount: number;
};

export type AdminAuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: string;
  actorName: string;
};
