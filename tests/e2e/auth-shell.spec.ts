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

test('student protected API rejects anonymous requests', async ({ request }) => {
  const response = await request.get('/api/protected/student');

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toMatchObject({ error: 'Unauthorized' });
});
