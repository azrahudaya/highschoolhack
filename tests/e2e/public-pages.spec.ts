import { expect, test } from '@playwright/test';

const publicPages = [
  ['/', 'HighschoolHack'],
  ['/articles', 'Bacaan untuk belajar, memilih, dan mempersiapkan diri.'],
  ['/about', 'Membantu siswa melihat masa depan sebagai perjalanan yang bisa direncanakan.'],
  ['/privacy', 'Cara HighschoolHack menjaga data siswa'],
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

test('landing page contains prompt-critical copy and CTAs', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Platform pendamping siswa SMA untuk mengenali potensi diri, merencanakan masa depan, dan mempersiapkan kehidupan setelah lulus.')).toBeVisible();
  await expect(page.getByText('Masa depan dibentuk dari langkah kecil yang kamu ambil hari ini.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Program Utama HighschoolHack' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Jelajahi Bekal 10/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Atur Goal-mu/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Kelola Finansial/ })).toBeVisible();
});

test('articles include Inspirasi category and prompt article titles', async ({ page }) => {
  await page.goto('/articles');

  await expect(page.getByRole('button', { name: 'Inspirasi' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '10 Beasiswa untuk Siswa SMA yang Perlu Kamu Pantau' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kisah Inspiratif Pelajar Sukses: Pola yang Bisa Kamu Tiru' })).toBeVisible();
});

test('article detail pages use unique body content', async ({ page }) => {
  await page.goto('/articles/beasiswa-untuk-siswa-sma');
  await expect(page.getByRole('heading', { name: 'Pantau jenis beasiswa, bukan hanya namanya' })).toBeVisible();

  await page.goto('/articles/kisah-inspiratif-pelajar-sukses');
  await expect(page.getByRole('heading', { name: 'Inspirasi yang sehat tidak membuatmu minder' })).toBeVisible();
  await expect(page.getByText('Pantau jenis beasiswa, bukan hanya namanya')).toHaveCount(0);
});

test('privacy page explains AI chatbot boundaries', async ({ page }) => {
  await page.goto('/privacy');

  await expect(page.getByText('Chatbot memakai AI pihak ketiga')).toBeVisible();
  await expect(page.getByText('Jangan menulis NISN, email, nomor telepon, alamat, atau data pribadi di chatbot.')).toBeVisible();
  await expect(page.getByText('Chatbot bukan pengganti Guru BK, psikolog, dokter, penasihat hukum, penasihat keuangan profesional, atau layanan darurat.')).toBeVisible();
});
