import { expect, test, type Page } from '@playwright/test';

const student = {
  id: 'student-1',
  email: 'siswa@example.com',
  name: 'Nadia',
  image: null,
  memberships: [{ id: 'membership-1', role: 'student', school: { id: 'school-1', name: 'SMA Nusantara', slug: 'sma-nusantara' } }],
};

const admin = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Admin Sekolah',
  image: null,
  memberships: [{ id: 'membership-admin', role: 'school_admin', school: { id: 'school-1', name: 'SMA Nusantara', slug: 'sma-nusantara' } }],
};

async function mockStudent(page: Page) {
  await page.route('**/api/auth/me', (route) => route.fulfill({ json: { user: student, authenticated: true, googleAuthConfigured: false } }));
}

test('Setting Goal dashboard renders real module shell', async ({ page }) => {
  await mockStudent(page);
  await page.route('**/api/student/programs/setting-goal', (route) => route.fulfill({
    json: {
      student: { name: 'Nadia', className: 'XI-1', schoolName: 'SMA Nusantara' },
      program: {
        slug: 'setting_goal',
        title: 'Setting Goal',
        description: 'Eksplorasi program studi dan karier.',
        progressPercentage: 0,
        completedCount: 0,
        totalModules: 8,
        currentModuleSlug: 'kenali-diriku',
        modules: [{ id: 'sg1', slug: 'kenali-diriku', title: 'Kenali Diriku', order: 1, status: 'not_started', completedAt: null }],
      },
    },
  }));

  await page.goto('/app/programs/setting-goal');
  await expect(page.getByRole('heading', { name: 'Setting Goal' })).toBeVisible();
  await expect(page.getByText('Rancang pilihan jurusan, karier, dan langkah nyata sejak kelas XI.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Buka modul/ })).toBeVisible();
});

test('Setting Goal module autosaves choices', async ({ page }) => {
  await mockStudent(page);
  await page.route('**/api/student/programs/setting-goal/portfolio', (route) => route.fulfill({ json: { modules: [] } }));
  await page.route('**/api/student/programs/setting-goal/modules/kenali-diriku', async (route) => {
    if (route.request().method() === 'PUT') return route.fulfill({ json: { savedAt: new Date().toISOString() } });
    return route.fulfill({ json: { module: { id: 'sg1', slug: 'kenali-diriku', title: 'Kenali Diriku', order: 1, status: 'not_started' }, response: null, config: null } });
  });

  await page.goto('/app/programs/setting-goal/modules/kenali-diriku');
  const autosave = page.waitForRequest((request) => request.method() === 'PUT' && request.url().includes('/setting-goal/modules/kenali-diriku'));
  await page.getByText('Analitis').click();
  expect((await autosave).postDataJSON()).toMatchObject({ data: { strengths: ['Analitis'] } });
  await expect(page.getByText('Tersimpan otomatis')).toBeVisible();
});

test('Smart Financial module shows readiness score', async ({ page }) => {
  await mockStudent(page);
  await page.route('**/api/student/programs/smart-financial/portfolio', (route) => route.fulfill({
    json: {
      modules: [
        { slug: 'identitas-dan-target', data: { emergencyFund: 1000000 } },
        { slug: 'pilih-kota-tujuan', data: { destinationCity: 'Yogyakarta' } },
      ],
    },
  }));
  await page.route('**/api/student/programs/smart-financial/modules/simulasi-financial-readiness', (route) => route.fulfill({
    json: {
      module: { id: 'sf3', slug: 'simulasi-financial-readiness', title: 'Simulasi Financial Readiness', order: 3, status: 'in_progress' },
      response: { monthlySavingPlan: 500000, decisionScore: 70, riskScore: 25, simulationReflection: 'Saya perlu menekan biaya kos.' },
      config: {
        cities: [{ city: 'Yogyakarta', housing: 800000, food: 1000000, transport: 250000, study: 250000 }],
        scholarships: [],
      },
    },
  }));

  await page.goto('/app/programs/smart-financial/modules/simulasi-financial-readiness');
  await expect(page.getByRole('heading', { name: 'Financial readiness score' })).toBeVisible();
  await expect(page.getByText('Formula MVP')).toBeVisible();
});

test('chatbot blocks sensitive student identifiers in the client', async ({ page }) => {
  await mockStudent(page);
  await page.route('**/api/student/programs/bekal-10', (route) => route.fulfill({
    json: {
      student: { name: 'Nadia', className: 'X-1', schoolName: 'SMA Nusantara' },
      program: { slug: 'bekal-10', title: 'Bekal 10', description: 'Demo', progressPercentage: 0, completedCount: 0, totalModules: 7, currentModuleSlug: null, modules: [] },
    },
  }));

  await page.goto('/app');
  await page.getByTitle('Buka Chatbot BK').click();
  await page.getByRole('button', { name: 'Saya paham dan lanjut' }).click();
  await page.getByPlaceholder('Tulis pertanyaan umum...').fill('email saya nadia@example.com, bagaimana belajar?');
  await page.getByTitle('Kirim').click();
  await expect(page.getByText('Jangan kirim NISN, email, nomor telepon, atau data pribadi ke chatbot.')).toBeVisible();
});

test('admin can submit bulk student import', async ({ page }) => {
  await page.route('**/api/auth/me', (route) => route.fulfill({ json: { user: admin, authenticated: true, googleAuthConfigured: false } }));
  await page.route('**/api/admin/overview', (route) => route.fulfill({ json: { school: { id: 'school-1', name: 'SMA Nusantara', slug: 'sma-nusantara' }, metrics: { totalClasses: 1, totalStudents: 0, totalTeachers: 0, totalAdmins: 1, completedStudents: 0 }, classes: [{ id: 'class-1', name: 'X-1', grade: 10 }] } }));
  await page.route('**/api/admin/students?*', (route) => route.fulfill({ json: { students: [] } }));
  await page.route('**/api/admin/students/bulk-import', (route) => route.fulfill({ status: 201, json: { imported: [{ email: 'siswa@example.com' }], errors: [] } }));

  await page.goto('/admin/students');
  const bulkInput = page.getByPlaceholder('siswa@example.com,Nadia Putri,X-1,0012345678');
  await bulkInput.fill('siswa@example.com,Nadia Putri,X-1,0012345678');
  await page.locator('body').click({ force: true, position: { x: 5, y: 5 } });
  await page.waitForFunction(() => window.visualViewport ? window.visualViewport.offsetTop === 0 : true);
  const request = page.waitForRequest((item) => item.method() === 'POST' && item.url().endsWith('/api/admin/students/bulk-import'));
  await page.getByRole('button', { name: 'Import siswa' }).click();
  expect((await request).postDataJSON()).toMatchObject({ students: [{ email: 'siswa@example.com', fullName: 'Nadia Putri', className: 'X-1', nisn: '0012345678' }] });
});
