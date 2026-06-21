import 'dotenv/config';
import { expect, request, test, type APIRequestContext } from '@playwright/test';
import { ProgramSlug, UserRole, ModuleStatus, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const password = 'Permission123!';

test.describe('backend cross-school permissions', () => {
  test.skip(!process.env.DATABASE_URL, 'DATABASE_URL is required for backend permission tests.');
  test.describe.configure({ mode: 'serial' });

  const state: {
    prefix: string;
    schools: string[];
    users: Record<string, { id: string; email: string }>;
  } = { prefix: `perm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, schools: [], users: {} };

  async function createUser(key: string, emailName: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: `${state.prefix}-${emailName}@example.com`,
        name: emailName,
        passwordHash,
        emailVerifiedAt: new Date(),
      },
    });
    state.users[key] = { id: user.id, email: user.email };
    return user;
  }

  async function login(email: string) {
    const context = await request.newContext({
      baseURL: 'http://localhost:4000',
      extraHTTPHeaders: {
        Origin: 'http://localhost:4000',
        Referer: 'http://localhost:4000/login',
      },
    });
    const response = await context.post('/api/auth/login', { data: { email, password } });
    expect(response.status()).toBe(200);
    return context;
  }

  test.beforeAll(async () => {
    const schoolA = await prisma.school.create({
      data: { name: `${state.prefix} School A`, slug: `${state.prefix}-school-a`, joinCode: `A-${state.prefix.slice(-8)}` },
    });
    const schoolB = await prisma.school.create({
      data: { name: `${state.prefix} School B`, slug: `${state.prefix}-school-b`, joinCode: `B-${state.prefix.slice(-8)}` },
    });
    state.schools.push(schoolA.id, schoolB.id);

    const [classA, classB] = await Promise.all([
      prisma.schoolClass.create({ data: { schoolId: schoolA.id, name: 'X-1', grade: 10 } }),
      prisma.schoolClass.create({ data: { schoolId: schoolB.id, name: 'X-1', grade: 10 } }),
    ]);

    const [studentA, studentB, teacherA, teacherB, adminA, schoolAdminOnly, superAdmin] = await Promise.all([
      createUser('studentA', 'student-a'),
      createUser('studentB', 'student-b'),
      createUser('teacherA', 'teacher-a'),
      createUser('teacherB', 'teacher-b'),
      createUser('adminA', 'admin-a'),
      createUser('schoolAdminOnly', 'admin-school-only'),
      createUser('superAdmin', 'super-admin'),
    ]);

    await prisma.$transaction([
      prisma.schoolMembership.create({ data: { userId: studentA.id, schoolId: schoolA.id, role: UserRole.student } }),
      prisma.schoolMembership.create({ data: { userId: studentB.id, schoolId: schoolB.id, role: UserRole.student } }),
      prisma.schoolMembership.create({ data: { userId: teacherA.id, schoolId: schoolA.id, role: UserRole.teacher_bk } }),
      prisma.schoolMembership.create({ data: { userId: teacherB.id, schoolId: schoolB.id, role: UserRole.teacher_bk } }),
      prisma.schoolMembership.create({ data: { userId: adminA.id, schoolId: schoolA.id, role: UserRole.school_admin } }),
      prisma.schoolMembership.create({ data: { userId: schoolAdminOnly.id, schoolId: schoolA.id, role: UserRole.school_admin } }),
      prisma.schoolMembership.create({ data: { userId: superAdmin.id, schoolId: schoolA.id, role: UserRole.super_admin } }),
      prisma.studentProfile.create({ data: { userId: studentA.id, schoolId: schoolA.id, classId: classA.id, fullName: 'Student A', nisn: `${state.prefix}-A` } }),
      prisma.studentProfile.create({ data: { userId: studentB.id, schoolId: schoolB.id, classId: classB.id, fullName: 'Student B', nisn: `${state.prefix}-B` } }),
      prisma.teacherProfile.create({ data: { userId: teacherA.id, fullName: 'Teacher A' } }),
      prisma.teacherProfile.create({ data: { userId: teacherB.id, fullName: 'Teacher B' } }),
    ]);

    const program = await prisma.program.upsert({
      where: { slug: ProgramSlug.bekal_10 },
      update: {},
      create: { slug: ProgramSlug.bekal_10, title: 'Bekal 10', grade: 10, description: 'Test program' },
    });
    const module = await prisma.programModule.upsert({
      where: { programId_slug: { programId: program.id, slug: 'permission-test-module' } },
      update: {},
      create: { programId: program.id, slug: 'permission-test-module', title: 'Permission Test Module', order: 99 },
    });

    const enrollmentA = await prisma.programEnrollment.create({ data: { userId: studentA.id, schoolId: schoolA.id, programId: program.id } });
    const enrollmentB = await prisma.programEnrollment.create({ data: { userId: studentB.id, schoolId: schoolB.id, programId: program.id } });
    await prisma.$transaction([
      prisma.moduleProgress.create({ data: { enrollmentId: enrollmentA.id, moduleId: module.id, status: ModuleStatus.completed, completedAt: new Date() } }),
      prisma.moduleProgress.create({ data: { enrollmentId: enrollmentB.id, moduleId: module.id, status: ModuleStatus.completed, completedAt: new Date() } }),
      prisma.moduleResponse.create({ data: { userId: studentA.id, enrollmentId: enrollmentA.id, moduleId: module.id, data: { note: 'school-a-only' } } }),
      prisma.moduleResponse.create({ data: { userId: studentB.id, enrollmentId: enrollmentB.id, moduleId: module.id, data: { note: 'school-b-only' } } }),
    ]);
  });

  test.afterAll(async () => {
    await prisma.school.deleteMany({ where: { id: { in: state.schools } } });
    await prisma.user.deleteMany({ where: { id: { in: Object.values(state.users).map((user) => user.id) } } });
    await prisma.$disconnect();
  });

  async function dispose(context: APIRequestContext) {
    await context.dispose();
  }

  test('teacher BK cannot read or write students from another school', async () => {
    const context = await login(state.users.teacherA.email);
    try {
      const detail = await context.get(`/api/teacher/bekal-10/students/${state.users.studentB.id}`);
      expect(detail.status()).toBe(404);

      const note = await context.post(`/api/teacher/bekal-10/students/${state.users.studentB.id}/notes`, {
        data: { category: 'follow-up', note: 'Cross school note must not be allowed.' },
      });
      expect(note.status()).toBe(404);

      const dashboard = await context.get('/api/teacher/bekal-10/dashboard');
      expect(dashboard.status()).toBe(200);
      const body = await dashboard.json() as { students: Array<{ userId: string }> };
      expect(body.students.map((student) => student.userId)).toContain(state.users.studentA.id);
      expect(body.students.map((student) => student.userId)).not.toContain(state.users.studentB.id);
    } finally {
      await dispose(context);
    }
  });

  test('school admin cannot manage students or teachers from another school', async () => {
    const context = await login(state.users.adminA.email);
    try {
      const list = await context.get('/api/admin/students');
      expect(list.status()).toBe(200);
      const body = await list.json() as { students: Array<{ userId: string }> };
      expect(body.students.map((student) => student.userId)).toContain(state.users.studentA.id);
      expect(body.students.map((student) => student.userId)).not.toContain(state.users.studentB.id);

      const update = await context.patch(`/api/admin/students/${state.users.studentB.id}`, {
        data: { fullName: 'Illegal Update', nisn: null, classId: null },
      });
      expect(update.status()).toBe(404);

      const revokeTeacher = await context.delete(`/api/admin/teachers/${state.users.teacherB.id}`);
      expect(revokeTeacher.status()).toBe(404);
    } finally {
      await dispose(context);
    }
  });

  test('student cannot access teacher or admin school APIs', async () => {
    const context = await login(state.users.studentA.email);
    try {
      const teacherDashboard = await context.get('/api/teacher/bekal-10/dashboard');
      expect(teacherDashboard.status()).toBe(403);

      const adminOverview = await context.get('/api/admin/overview');
      expect(adminOverview.status()).toBe(403);
    } finally {
      await dispose(context);
    }
  });

  test('super admin cleanup APIs stay restricted to super admin role', async () => {
    const schoolAdmin = await login(state.users.schoolAdminOnly.email);
    try {
      const denied = await schoolAdmin.get('/api/admin/cleanup/schools');
      expect(denied.status()).toBe(403);
    } finally {
      await dispose(schoolAdmin);
    }

    const superAdmin = await login(state.users.superAdmin.email);
    try {
      const allowed = await superAdmin.get('/api/admin/cleanup/schools');
      expect(allowed.status()).toBe(200);
      const body = await allowed.json() as { schools: Array<{ id: string }> };
      expect(body.schools.map((school) => school.id)).toEqual(expect.arrayContaining(state.schools));
    } finally {
      await dispose(superAdmin);
    }
  });
});
