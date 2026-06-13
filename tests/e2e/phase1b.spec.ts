import { expect, test, type Page } from '@playwright/test';

const student = {
  id: 'student-1',
  email: 'siswa@example.com',
  name: 'Nadia',
  image: null,
  memberships: [{ id: 'membership-1', role: 'student', school: { id: 'school-1', name: 'SMA Nusantara', slug: 'sma-nusantara' } }],
};

const teacher = {
  id: 'teacher-1',
  email: 'bk@example.com',
  name: 'Bu Rina',
  image: null,
  memberships: [{ id: 'membership-2', role: 'teacher_bk', school: { id: 'school-1', name: 'SMA Nusantara', slug: 'sma-nusantara' } }],
};

const portfolio = {
  student: { userId: 'student-1', name: 'Nadia', nisn: '0012345', className: 'X-1', schoolName: 'SMA Nusantara' },
  program: { title: 'Bekal 10', completedCount: 3, totalModules: 7, progressPercentage: 43, completed: false },
  badges: [{ order: 1, label: 'Langkah Pertama' }, { order: 2, label: 'Pengenal Diri' }, { order: 3, label: 'Vision Maker' }],
  modules: [
    { id: 'm1', slug: 'langkah-awalku-di-sma', title: 'Langkah Awalku di SMA', order: 1, status: 'completed', completedAt: '2026-01-01', data: { challenges: ['Mengatur waktu'], reflectionStrategy: 'Saya akan menyusun jadwal belajar mingguan.' } },
    { id: 'm2', slug: 'mengenal-diriku-lebih-dekat', title: 'Mengenal Diriku Lebih Dekat', order: 2, status: 'completed', completedAt: '2026-01-02', data: { results: { riasec: { dominant: [{ label: 'Social' }, { label: 'Artistic' }] }, vark: { dominant: { label: 'Visual' } } }, selfInsight: 'Saya menikmati kegiatan yang melibatkan orang lain.' } },
    { id: 'm3', slug: 'vision-board-sma-ku', title: 'Vision Board SMA-ku', order: 3, status: 'completed', completedAt: '2026-01-03', data: { achievements: ['Nilai akademik meningkat'], biggestHope: 'Saya ingin menjadi pribadi yang lebih percaya diri.' } },
    { id: 'm4', slug: 'target-pengembangan-diri', title: 'Target Pengembangan Diri', order: 4, status: 'not_started', completedAt: null, data: null },
  ],
};

async function mockAuth(page: Page, user: typeof student | typeof teacher) {
  await page.route('**/api/auth/me', (route) => route.fulfill({ json: { user, authenticated: true, googleAuthConfigured: false } }));
}

test('module three renders and autosaves vision board choices', async ({ page }) => {
  await mockAuth(page, student);
  await page.route('**/api/student/programs/bekal-10/modules/vision-board-sma-ku', async (route) => {
    if (route.request().method() === 'PUT') return route.fulfill({ json: { savedAt: new Date().toISOString() } });
    return route.fulfill({ json: { module: { id: 'm3', slug: 'vision-board-sma-ku', title: 'Vision Board SMA-ku', order: 3, status: 'in_progress' }, response: null, config: null } });
  });

  await page.goto('/app/programs/bekal-10/modules/vision-board-sma-ku');
  await expect(page.getByRole('heading', { name: 'Vision Board SMA-ku' })).toBeVisible();
  const autosave = page.waitForRequest((request) => request.method() === 'PUT' && request.url().endsWith('/modules/vision-board-sma-ku'));
  await page.getByText('Nilai akademik meningkat').click();
  expect((await autosave).postDataJSON()).toMatchObject({ data: { achievements: ['Nilai akademik meningkat'] } });
  await expect(page.getByText('Tersimpan otomatis')).toBeVisible();
});

test('student portfolio renders completed modules and print action', async ({ page }) => {
  await mockAuth(page, student);
  await page.route('**/api/student/programs/bekal-10/portfolio', (route) => route.fulfill({ json: portfolio }));
  await page.goto('/app/portfolio');

  await expect(page.getByRole('heading', { name: 'Nadia', level: 1 })).toBeVisible();
  await expect(page.getByText('RIASEC dominan')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cetak / Simpan PDF' })).toBeVisible();
  const dimensions = await page.locator('body').evaluate((body) => ({ clientWidth: body.clientWidth, scrollWidth: body.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('teacher dashboard renders school metrics and student table', async ({ page }) => {
  await mockAuth(page, teacher);
  await page.route('**/api/teacher/bekal-10/dashboard*', (route) => route.fulfill({
    json: {
      school: { id: 'school-1', name: 'SMA Nusantara', classes: [{ id: 'class-1', name: 'X-1', grade: 10 }] },
      metrics: { totalStudents: 20, averageProgress: 56, completedStudents: 4, needsAttention: 3 },
      distributions: { riasec: { Social: 8, Artistic: 5 }, vark: { Visual: 9 }, adaptationChallenges: { 'Mengatur waktu': 7 }, developmentAreas: { 'Percaya diri': 6 }, difficultSubjects: { Matematika: 8 } },
      students: [{ userId: 'student-1', name: 'Nadia', nisn: '0012345', className: 'X-1', completedCount: 3, progressPercentage: 43, needsAttention: false }],
    },
  }));
  await page.goto('/teacher');

  await expect(page.getByRole('heading', { name: 'Monitoring perkembangan siswa' })).toBeVisible();
  await expect(page.getByText('56%')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Nadia' })).toBeVisible();
  const dimensions = await page.locator('body').evaluate((body) => ({ clientWidth: body.clientWidth, scrollWidth: body.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('teacher can view student portfolio read-only', async ({ page }) => {
  await mockAuth(page, teacher);
  await page.route('**/api/teacher/bekal-10/students/student-1', (route) => route.fulfill({ json: portfolio }));
  await page.goto('/teacher/students/student-1');
  await expect(page.getByRole('heading', { name: 'Nadia', level: 1 })).toBeVisible();
  await expect(page.getByText('Mengatur waktu', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cetak / Simpan PDF' })).toBeVisible();
});
