import { expect, test } from '@playwright/test';

test('login page renders auth shell', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Masuk ke akunmu' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('login page explains required email verification after register', async ({ page }) => {
  await page.goto('/login?verify-email=1');

  await expect(page.getByText('Akun berhasil dibuat. Cek email verifikasi sebelum login.')).toBeVisible();
});

test('register page has no horizontal overflow', async ({ page }) => {
  await page.goto('/register');

  await expect(page.getByRole('heading', { name: 'Buat akun HighschoolHack' })).toBeVisible();

  const viewportWidth = await page.locator('body').evaluate((body) => body.clientWidth);
  const contentWidth = await page.locator('body').evaluate((body) => body.scrollWidth);

  expect(contentWidth).toBeLessThanOrEqual(viewportWidth);
});

test('anonymous users are redirected from student portal', async ({ page }) => {
  await page.goto('/app');

  await expect(page).toHaveURL(/\/login$/);
});

test('student onboarding accepts manual school and class input', async ({ page }) => {
  await page.route('**/api/auth/me', (route) => route.fulfill({
    json: {
      user: { id: 'student-1', email: 'siswa@example.com', name: 'Nadia', image: null, memberships: [] },
      authenticated: true,
      googleAuthConfigured: false,
    },
  }));
  await page.route('**/api/onboarding/student', (route) => route.fulfill({
    status: 201,
    json: { redirectTo: '/app' },
  }));

  await page.goto('/onboarding');
  await page.getByLabel('Nama lengkap').fill('Nadia Putri');
  await page.getByLabel('Nama sekolah').fill('SMA Nusantara Baru');
  await page.getByLabel('Kelas').fill('X-1');

  const onboardingRequest = page.waitForRequest((request) => request.method() === 'POST' && request.url().endsWith('/api/onboarding/student'));
  await page.getByRole('button', { name: 'Masuk ke Bekal 10' }).click();
  const payload = (await onboardingRequest).postDataJSON();

  expect(payload).toMatchObject({ fullName: 'Nadia Putri', schoolName: 'SMA Nusantara Baru', className: 'X-1' });
  expect(payload.schoolId).toBeUndefined();
  expect(payload.schoolJoinCode).toBeUndefined();
});

test('student onboarding preserves Smart Financial next target', async ({ page }) => {
  let onboarded = false;
  await page.route('**/api/auth/me', (route) => route.fulfill({
    json: {
      user: {
        id: 'student-1',
        email: 'siswa@example.com',
        name: 'Nadia',
        image: null,
        memberships: onboarded ? [{ id: 'membership-1', role: 'student', school: { id: 'school-1', name: 'SMA Nusantara Baru', slug: 'sma-nusantara-baru' } }] : [],
      },
      authenticated: true,
      googleAuthConfigured: false,
    },
  }));
  await page.route('**/api/onboarding/student', (route) => {
    onboarded = true;
    return route.fulfill({
      status: 201,
      json: { redirectTo: '/app' },
    });
  });
  await page.route('**/api/student/programs/smart-financial', (route) => route.fulfill({
    json: {
      student: { name: 'Nadia', className: 'XII IPA 2', grade: 12, schoolName: 'SMA Nusantara Baru' },
      program: {
        slug: 'smart-financial',
        title: 'Smart Financial',
        description: 'Simulasi finansial.',
        progressPercentage: 0,
        completedCount: 0,
        totalModules: 4,
        currentModuleSlug: 'identitas-dan-target',
        modules: [{ id: 'sf1', slug: 'identitas-dan-target', title: 'Identitas dan Target', order: 1, status: 'not_started', completedAt: null }],
      },
    },
  }));

  await page.goto('/onboarding');
  await page.evaluate(() => window.localStorage.setItem('hsh-post-onboarding-next', '/app/programs/smart-financial'));
  await page.reload();

  await expect(page.getByRole('button', { name: 'Masuk ke Smart Financial' })).toBeVisible();
  await page.getByLabel('Nama lengkap').fill('Nadia Putri');
  await page.getByLabel('Nama sekolah').fill('SMA Nusantara Baru');
  await page.getByLabel('Kelas').fill('XII IPA 2');

  await page.getByRole('button', { name: 'Masuk ke Smart Financial' }).click();
  await expect(page).toHaveURL(/\/app\/programs\/smart-financial/);
});

test('student protected API rejects anonymous requests', async ({ request }) => {
  const response = await request.get('/api/protected/student');

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toMatchObject({ error: 'Unauthorized' });
});

test('Bekal 10 APIs and module routes reject anonymous users', async ({ page, request }) => {
  const response = await request.get('/api/student/programs/bekal-10');
  expect(response.status()).toBe(401);

  await page.goto('/app/programs/bekal-10/modules/langkah-awalku-di-sma');
  await expect(page).toHaveURL(/\/login$/);
});

test('teacher dashboard API rejects anonymous users', async ({ request }) => {
  const response = await request.get('/api/teacher/bekal-10/dashboard');
  expect(response.status()).toBe(401);
});

test('admin school API rejects anonymous users', async ({ request }) => {
  const response = await request.get('/api/admin/overview');
  expect(response.status()).toBe(401);
});
