import { expect, test } from '@playwright/test';

const publicPages = [
  ['/', 'HighschoolHack'],
  ['/articles', 'Bacaan untuk belajar, memilih, dan mempersiapkan diri.'],
  ['/about', 'Membantu siswa melihat masa depan sebagai perjalanan yang bisa direncanakan.'],
  ['/programs/bekal-10', 'Bekal 10'],
  ['/programs/setting-goal', 'Setting Goal'],
  ['/programs/smart-financial', 'Smart Financial'],
] as const;

for (const [path, heading] of publicPages) {
  test(`${path} renders without horizontal overflow`, async ({ page }) => {
    await page.goto(path);

    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();

    const dimensions = await page.locator('body').evaluate((body) => ({
      clientWidth: body.clientWidth,
      scrollWidth: body.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
}

test('landing hero image loads', async ({ page }) => {
  await page.goto('/');

  const hero = page.getByRole('img', { name: 'Siswa SMA merencanakan masa depan bersama' });
  await expect(hero).toBeVisible();
  await expect(hero).toHaveJSProperty('complete', true);
});
