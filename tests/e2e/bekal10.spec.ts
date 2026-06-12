import { expect, test, type Page } from '@playwright/test';

const student = {
  id: 'student-1',
  email: 'siswa@example.com',
  name: 'Nadia',
  image: null,
  memberships: [
    {
      id: 'membership-1',
      role: 'student',
      school: { id: 'school-1', name: 'SMA Nusantara', slug: 'sma-nusantara' },
    },
  ],
};

const dashboard = {
  student: { name: 'Nadia', className: 'X IPA 1', schoolName: 'SMA Nusantara' },
  program: {
    slug: 'bekal-10',
    title: 'Bekal 10',
    description: 'Perjalanan awal siswa kelas X.',
    progressPercentage: 14,
    completedCount: 1,
    totalModules: 7,
    currentModuleSlug: 'mengenal-diriku-lebih-dekat',
    modules: [
      { id: 'm1', slug: 'langkah-awalku-di-sma', title: 'Langkah Awalku di SMA', order: 1, status: 'completed', completedAt: new Date().toISOString() },
      { id: 'm2', slug: 'mengenal-diriku-lebih-dekat', title: 'Mengenal Diriku Lebih Dekat', order: 2, status: 'in_progress', completedAt: null },
      { id: 'm3', slug: 'vision-board-sma-ku', title: 'Vision Board SMA-ku', order: 3, status: 'locked', completedAt: null },
    ],
  },
};

async function mockStudent(page: Page) {
  await page.route('**/api/auth/me', (route) => route.fulfill({ json: { user: student, authenticated: true, googleAuthConfigured: false } }));
  await page.route('**/api/student/programs/bekal-10', (route) => route.fulfill({ json: dashboard }));
}

test('real Bekal 10 dashboard renders progress without overflow', async ({ page }) => {
  await mockStudent(page);
  await page.goto('/app/programs/bekal-10');

  await expect(page.getByRole('heading', { name: 'Kenali dirimu, mulai langkahmu.' })).toBeVisible();
  await expect(page.getByText('14%')).toBeVisible();
  await expect(page.getByText('Mengenal Diriku Lebih Dekat')).toBeVisible();

  const dimensions = await page.locator('body').evaluate((body) => ({ clientWidth: body.clientWidth, scrollWidth: body.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('module one autosaves student input', async ({ page }) => {
  await mockStudent(page);
  await page.route('**/api/student/programs/bekal-10/modules/langkah-awalku-di-sma', async (route) => {
    if (route.request().method() === 'PUT') {
      await route.fulfill({ json: { savedAt: new Date().toISOString() } });
      return;
    }
    await route.fulfill({
      json: {
        module: { id: 'm1', slug: 'langkah-awalku-di-sma', title: 'Langkah Awalku di SMA', order: 1, status: 'in_progress' },
        response: null,
        config: null,
      },
    });
  });

  await page.goto('/app/programs/bekal-10/modules/langkah-awalku-di-sma');
  await expect(page.getByRole('heading', { name: 'Langkah Awalku di SMA' })).toBeVisible();

  const autosave = page.waitForRequest((request) => request.method() === 'PUT' && request.url().endsWith('/modules/langkah-awalku-di-sma'));
  await page.getByText('Pelajaran baru').click();
  const request = await autosave;

  expect(request.postDataJSON()).toMatchObject({ data: { excitement: ['Pelajaran baru'] } });
  await expect(page.getByText('Tersimpan otomatis')).toBeVisible();
});

test('module two renders assessments on mobile without overflow', async ({ page }) => {
  await mockStudent(page);
  await page.route('**/api/student/programs/bekal-10/modules/mengenal-diriku-lebih-dekat', (route) => route.fulfill({
    json: {
      module: { id: 'm2', slug: 'mengenal-diriku-lebih-dekat', title: 'Mengenal Diriku Lebih Dekat', order: 2, status: 'in_progress' },
      response: null,
      config: {
        riasec: {
          items: [{ id: 'r1', category: 'R', text: 'Saya menikmati kegiatan praktik langsung.' }],
          labels: { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' },
          scale: [{ value: 1, label: 'Sangat tidak sesuai' }, { value: 2, label: 'Tidak sesuai' }, { value: 3, label: 'Cukup sesuai' }, { value: 4, label: 'Sesuai' }, { value: 5, label: 'Sangat sesuai' }],
        },
        vark: {
          items: [{ id: 'vark1', text: 'Saat mempelajari topik baru, saya memilih...', options: [{ category: 'V', text: 'melihat diagram' }, { category: 'A', text: 'mendengar penjelasan' }, { category: 'R', text: 'membaca catatan' }, { category: 'K', text: 'praktik langsung' }] }],
          labels: { V: 'Visual', A: 'Aural', R: 'Read/write', K: 'Kinesthetic' },
        },
      },
    },
  }));

  await page.goto('/app/programs/bekal-10/modules/mengenal-diriku-lebih-dekat');
  await expect(page.getByRole('heading', { name: 'Asesmen minat RIASEC - 0/1' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Preferensi belajar - 0/1' })).toBeVisible();

  const dimensions = await page.locator('body').evaluate((body) => ({ clientWidth: body.clientWidth, scrollWidth: body.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
