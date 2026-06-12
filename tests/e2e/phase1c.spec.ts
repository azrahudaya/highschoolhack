import { expect, test, type Page } from '@playwright/test';

const admin = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Admin Sekolah',
  image: null,
  memberships: [{ id: 'membership-admin', role: 'school_admin', school: { id: 'school-1', name: 'SMA Nusantara', slug: 'sma-nusantara' } }],
};

const overview = {
  school: { id: 'school-1', name: 'SMA Nusantara', slug: 'sma-nusantara' },
  metrics: { totalClasses: 3, totalStudents: 120, totalTeachers: 4, totalAdmins: 1, completedStudents: 18 },
  classes: [{ id: 'class-1', name: 'X-1', grade: 10 }, { id: 'class-2', name: 'XI-1', grade: 11 }],
};

async function mockAdmin(page: Page) {
  await page.route('**/api/auth/me', (route) => route.fulfill({ json: { user: admin, authenticated: true, googleAuthConfigured: false } }));
}

test('admin overview renders school metrics without overflow', async ({ page }) => {
  await mockAdmin(page);
  await page.route('**/api/admin/overview', (route) => route.fulfill({ json: overview }));
  await page.goto('/admin');

  await expect(page.getByRole('heading', { name: 'Ringkasan sekolah' })).toBeVisible();
  await expect(page.getByText('Onboarding nama sekolah')).toBeVisible();
  await expect(page.getByText('120')).toBeVisible();
  const dimensions = await page.locator('body').evaluate((body) => ({ clientWidth: body.clientWidth, scrollWidth: body.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('admin can create a class from the UI', async ({ page }) => {
  await mockAdmin(page);
  await page.route('**/api/admin/classes', async (route) => {
    if (route.request().method() === 'POST') return route.fulfill({ status: 201, json: { schoolClass: { id: 'class-3', name: 'X-2', grade: 10 } } });
    return route.fulfill({ json: { classes: [{ id: 'class-1', name: 'X-1', grade: 10, studentCount: 30 }] } });
  });
  await page.goto('/admin/classes');

  const createRequest = page.waitForRequest((request) => request.method() === 'POST' && request.url().endsWith('/api/admin/classes'));
  await page.getByLabel('Nama kelas').fill('X-2');
  await page.getByRole('button', { name: 'Tambah kelas' }).click();
  expect((await createRequest).postDataJSON()).toEqual({ name: 'X-2', grade: 10 });
  await expect(page.getByText('Kelas berhasil ditambahkan.')).toBeVisible();
});

test('admin can update student school profile', async ({ page }) => {
  await mockAdmin(page);
  await page.route('**/api/admin/overview', (route) => route.fulfill({ json: overview }));
  await page.route('**/api/admin/students/student-1', (route) => route.fulfill({ json: { student: { userId: 'student-1', fullName: 'Nadia Putri', email: 'nadia@example.com', nisn: '0099', classId: 'class-2', className: 'XI-1' } } }));
  await page.route('**/api/admin/students?*', (route) => route.fulfill({ json: { students: [{ userId: 'student-1', fullName: 'Nadia', email: 'nadia@example.com', nisn: '0011', classId: 'class-1', className: 'X-1', joinedAt: '2026-01-01' }] } }));
  await page.goto('/admin/students');

  await page.getByTitle('Edit Nadia').click();
  await page.getByLabel('Nama lengkap').fill('Nadia Putri');
  await page.getByLabel('NISN').fill('0099');
  await page.getByLabel('Kelas siswa').selectOption('class-2');
  const updateRequest = page.waitForRequest((request) => request.method() === 'PATCH' && request.url().includes('/api/admin/students/student-1'));
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  expect((await updateRequest).postDataJSON()).toMatchObject({ fullName: 'Nadia Putri', nisn: '0099', classId: 'class-2' });
  await expect(page.getByText('Profil siswa berhasil diperbarui.')).toBeVisible();
});

test('admin can assign a registered Guru BK account', async ({ page }) => {
  await mockAdmin(page);
  await page.route('**/api/admin/teachers', async (route) => {
    if (route.request().method() === 'POST') return route.fulfill({ status: 201, json: { teacher: { userId: 'teacher-1', email: 'bk@example.com', fullName: 'Bu Rina' } } });
    return route.fulfill({ json: { teachers: [] } });
  });
  await page.goto('/admin/teachers');

  await page.getByLabel('Email akun').fill('bk@example.com');
  await page.getByLabel('Nama lengkap').fill('Bu Rina');
  const assignRequest = page.waitForRequest((request) => request.method() === 'POST' && request.url().endsWith('/api/admin/teachers'));
  await page.getByRole('button', { name: 'Tetapkan Guru BK' }).click();
  expect((await assignRequest).postDataJSON()).toEqual({ email: 'bk@example.com', fullName: 'Bu Rina' });
  await expect(page.getByText('Akun berhasil ditetapkan sebagai Guru BK.')).toBeVisible();
});

test('school settings explain manual student onboarding', async ({ page }) => {
  await mockAdmin(page);
  await page.route('**/api/admin/overview', (route) => route.fulfill({ json: overview }));
  await page.goto('/admin/school');

  await expect(page.getByRole('heading', { name: 'Pengaturan sekolah' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Onboarding siswa' })).toBeVisible();
  await expect(page.getByText('Siswa mencari dan memilih nama sekolah saat onboarding.')).toBeVisible();
});
