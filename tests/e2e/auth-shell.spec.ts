import { expect, test } from '@playwright/test';

test('login page renders auth shell', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Masuk ke akunmu' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
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

test('student onboarding uses manual school lookup instead of join code', async ({ page }) => {
  await page.route('**/api/auth/me', (route) => route.fulfill({
    json: {
      user: { id: 'student-1', email: 'siswa@example.com', name: 'Nadia', image: null, memberships: [] },
      authenticated: true,
      googleAuthConfigured: false,
    },
  }));
  await page.route('**/api/schools/lookup?*', (route) => route.fulfill({
    json: {
      schools: [{
        id: 'school-1',
        name: 'SMA Nusantara',
        slug: 'sma-nusantara',
        classes: [{ id: 'class-1', name: 'X-1', grade: 10 }],
      }],
    },
  }));
  await page.route('**/api/onboarding/student', (route) => route.fulfill({
    status: 201,
    json: { redirectTo: '/app' },
  }));

  await page.goto('/onboarding');
  await page.getByLabel('Nama sekolah').fill('Nusantara');
  await page.getByTitle('Cari sekolah').click();
  await page.getByRole('button', { name: /SMA Nusantara/ }).click();
  await page.getByLabel('Nama lengkap').fill('Nadia Putri');
  await page.getByLabel('Kelas').selectOption('class-1');

  const onboardingRequest = page.waitForRequest((request) => request.method() === 'POST' && request.url().endsWith('/api/onboarding/student'));
  await page.getByRole('button', { name: 'Selesaikan Onboarding' }).click();
  const payload = (await onboardingRequest).postDataJSON();

  expect(payload).toMatchObject({ fullName: 'Nadia Putri', schoolId: 'school-1', classId: 'class-1' });
  expect(payload.schoolJoinCode).toBeUndefined();
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
