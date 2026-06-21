import { expect, test, type Page } from '@playwright/test';
import { simulationSteps } from '../../client/src/data/smart-financial';
import { smartFinancialSimulationStepIds } from '../../server/src/data/smart-financial';

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

test('Smart Financial simulation contract matches client steps', () => {
  expect(simulationSteps.map((step) => step.id)).toEqual([...smartFinancialSimulationStepIds]);
});

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

test('Setting Goal dashboard explains locked modules with previous-module action', async ({ page }) => {
  await mockStudent(page);
  await page.route('**/api/student/programs/setting-goal', (route) => route.fulfill({
    json: {
      student: { name: 'Nadia', className: 'XI-1', grade: 11, schoolName: 'SMA Nusantara' },
      program: {
        slug: 'setting-goal',
        title: 'Setting Goal',
        description: 'Eksplorasi program studi dan karier.',
        progressPercentage: 12,
        completedCount: 1,
        totalModules: 8,
        currentModuleSlug: 'eksplorasi-program-studi',
        modules: [
          { id: 'sg1', slug: 'kenali-diriku', title: 'Kenali Diriku', order: 1, status: 'completed', completedAt: null },
          { id: 'sg2', slug: 'eksplorasi-program-studi', title: 'Eksplorasi Program Studi', order: 2, status: 'locked', completedAt: null },
        ],
      },
    },
  }));

  await page.goto('/app/programs/setting-goal');
  await page.getByRole('button', { name: /Selesaikan tahap sebelumnya/ }).click();
  await expect(page.getByRole('heading', { name: 'Modul Masih Terkunci' })).toBeVisible();
  await expect(page.getByText('Modul 2: Eksplorasi Program Studi')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ke Modul Sebelumnya' })).toHaveAttribute('href', '/app/programs/setting-goal/modules/kenali-diriku');
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

test('Setting Goal captures four macro targets', async ({ page }) => {
  await mockStudent(page);
  await page.route('**/api/student/programs/setting-goal/portfolio', (route) => route.fulfill({ json: { modules: [] } }));
  await page.route('**/api/student/programs/setting-goal/modules/goal-setting', async (route) => {
    if (route.request().method() === 'PUT') return route.fulfill({ json: { savedAt: new Date().toISOString() } });
    return route.fulfill({ json: { module: { id: 'sg5', slug: 'goal-setting', title: 'Buat Tujuanmu Sekarang', order: 5, status: 'not_started' }, response: null, config: null } });
  });

  await page.goto('/app/programs/setting-goal/modules/goal-setting');
  await expect(page.getByRole('heading', { name: 'Buat Tujuanmu Sekarang' })).toBeVisible();

  const autosave = page.waitForRequest((request) => request.method() === 'PUT' && request.url().includes('/setting-goal/modules/goal-setting'));
  await page.getByLabel('Target Akademik').fill('abc akademik');
  await page.getByLabel('Target Karier').fill('abc karier');
  await page.getByLabel('Target Pribadi').fill('abc pribadi');
  await page.getByLabel('Target Sosial').fill('abc sosial');

  expect((await autosave).postDataJSON()).toMatchObject({
    data: {
      academicTarget: 'abc akademik',
      careerTarget: 'abc karier',
      personalTarget: 'abc pribadi',
      socialTarget: 'abc sosial',
    },
  });
});

test('Setting Goal action plan adds calendar items, opens detail, and deletes plans', async ({ page }) => {
  await mockStudent(page);
  await page.route('**/api/student/programs/setting-goal/portfolio', (route) => route.fulfill({
    json: {
      modules: [
        { slug: 'goal-setting', data: { academicTarget: 'Nilai Biologi 90', careerTarget: 'Psikologi', personalTarget: 'Disiplin', socialTarget: 'Aktif organisasi' } },
      ],
    },
  }));
  await page.route('**/api/student/programs/setting-goal/modules/rencana-aksi', async (route) => {
    if (route.request().method() === 'PUT') return route.fulfill({ json: { savedAt: new Date().toISOString() } });
    return route.fulfill({ json: { module: { id: 'sg6', slug: 'rencana-aksi', title: 'Langkah Nyata Menuju Tujuanmu', order: 6, status: 'not_started' }, response: null, config: null } });
  });

  await page.goto('/app/programs/setting-goal/modules/rencana-aksi');
  await expect(page.getByRole('heading', { name: 'Langkah Nyata Menuju Tujuanmu' })).toBeVisible();

  await page.getByLabel('Nama Rencana').fill('belajar sosiologi agar nilai 89');
  await page.getByLabel('Tanggal').fill('2026-06-25');
  await page.getByLabel('Prioritas').selectOption('P2');

  const addSave = page.waitForRequest((request) => request.method() === 'PUT' && request.url().includes('/setting-goal/modules/rencana-aksi'));
  await page.getByRole('button', { name: /Tambah Rencana/ }).click();
  expect((await addSave).postDataJSON()).toMatchObject({
    data: {
      actionPlans: [
        {
          title: 'belajar sosiologi agar nilai 89',
          date: '2026-06-25',
          priority: 'P2',
        },
      ],
    },
  });

  await expect(page.getByRole('heading', { name: 'Semua Rencana' })).toBeVisible();
  await expect(page.getByText('belajar sosiologi agar nilai 89')).toBeVisible();
  await expect(page.getByText('Juni 2026', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Lihat belajar sosiologi agar nilai 89/ }).click();
  await expect(page.getByText('Detail Rencana')).toBeVisible();
  await expect(page.getByText('P2: Penting').last()).toBeVisible();
  await page.getByTitle('Tutup').click();

  const deleteSave = page.waitForRequest((request) => request.method() === 'PUT' && request.url().includes('/setting-goal/modules/rencana-aksi'));
  await page.getByTitle('Hapus rencana').click();
  expect((await deleteSave).postDataJSON()).toMatchObject({ data: { actionPlans: [] } });
  await expect(page.getByText('Belum ada rencana.')).toBeVisible();
});

test('Smart Financial Future Ready Board is interactive and autosaves decisions', async ({ page }) => {
  await mockStudent(page);
  await page.route('**/api/student/programs/smart-financial/portfolio', (route) => route.fulfill({
    json: {
      modules: [
        { slug: 'identitas-dan-target', data: { monthlyAllowance: 1500000, currentSavings: 1000000, emergencyFund: 1000000 } },
        { slug: 'pilih-kota-tujuan', data: { destinationCity: 'Yogyakarta', livingStrategy: 'Kos berbagi' } },
      ],
    },
  }));
  await page.route('**/api/student/programs/smart-financial/modules/simulasi-financial-readiness', async (route) => {
    if (route.request().method() === 'PUT') return route.fulfill({ json: { savedAt: new Date().toISOString() } });
    return route.fulfill({
      json: {
        module: { id: 'sf3', slug: 'simulasi-financial-readiness', title: 'Future Ready Board', order: 3, status: 'in_progress' },
        response: { monthlySavingPlan: '', simulationDecisions: {}, emergencyCards: [], simulationReflection: 'Saya perlu menekan biaya kos.' },
        config: {
          cities: [{ city: 'Yogyakarta', housing: 800000, food: 1000000, transport: 250000, study: 250000 }],
          scholarships: [],
        },
      },
    });
  });

  await page.goto('/app/programs/smart-financial/modules/simulasi-financial-readiness');
  await expect(page.getByRole('heading', { name: 'Simulasi 12 langkah' })).toBeVisible();
  await expect(page.getByText('Rekomendasi keputusan akhir')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Langkah 1-3' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Laundry' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Langkah 4-6' }).click();
  await expect(page.getByRole('heading', { name: 'Laundry' })).toBeVisible();
  await page.getByRole('button', { name: 'Langkah 1-3' }).click();
  await expect(page.getByRole('button', { name: /Diskusi opsi dengan keluarga/ })).toBeVisible();

  const savingInput = page.getByLabel('Rencana menabung per bulan');
  await expect(savingInput).toHaveValue('');
  await savingInput.fill('0500000');
  await expect(savingInput).toHaveValue('500000');
  await savingInput.fill('');
  await expect(savingInput).toHaveValue('');

  const decisionSave = page.waitForRequest((request) => request.method() === 'PUT' && request.url().includes('/smart-financial/modules/simulasi-financial-readiness'));
  await page.getByRole('button', { name: /Bandingkan 2 kota dan 2 kampus/ }).click();
  await expect(page.getByText('1/12 keputusan')).toBeVisible();
  const decisionPayload = (await decisionSave).postDataJSON();
  expect(decisionPayload).toMatchObject({ data: { monthlySavingPlan: '', simulationDecisions: { target: 'compare' } } });

  const emergencySave = page.waitForRequest((request) => request.method() === 'PUT' && request.url().includes('/smart-financial/modules/simulasi-financial-readiness'));
  await page.getByRole('button', { name: /Ambil emergency card/ }).click();
  const emergencyPayload = (await emergencySave).postDataJSON();
  expect(emergencyPayload.data.emergencyCards).toHaveLength(1);
  await expect(page.getByText('Belum ada kartu darurat yang diambil.')).toHaveCount(0);
});

test('Smart Financial financial inputs can remove leading zeroes and be cleared', async ({ page }) => {
  await mockStudent(page);
  await page.route('**/api/student/programs/smart-financial/portfolio', (route) => route.fulfill({ json: { modules: [] } }));
  await page.route('**/api/student/programs/smart-financial/modules/identitas-dan-target', async (route) => {
    if (route.request().method() === 'PUT') return route.fulfill({ json: { savedAt: new Date().toISOString() } });
    return route.fulfill({
      json: {
        module: { id: 'sf1', slug: 'identitas-dan-target', title: 'Identitas dan Target', order: 1, status: 'not_started' },
        response: null,
        config: { cities: [], scholarships: [], student: { schoolName: 'SMA Nusantara', className: 'XII IPA 2' } },
      },
    });
  });

  await page.goto('/app/programs/smart-financial/modules/identitas-dan-target');
  await expect(page.getByRole('heading', { name: 'Konsep Modul' })).toBeVisible();
  await expect(page.getByLabel('Nama panggilan')).toBeVisible();
  await expect(page.getByLabel('Sekolah')).toHaveValue('SMA Nusantara');
  await expect(page.getByLabel('Kelas')).toHaveValue('XII IPA 2');

  const allowanceInput = page.getByLabel('Uang saku per bulan');
  await expect(allowanceInput).toHaveValue('');
  await allowanceInput.fill('0500000');
  await expect(allowanceInput).toHaveValue('500000');
  await allowanceInput.fill('');
  await expect(allowanceInput).toHaveValue('');
});

test('Smart Financial scholarship portal and PDF portfolio entry points are available', async ({ page }) => {
  await mockStudent(page);

  await page.goto('/app/programs/smart-financial/scholarships');
  await expect(page.getByRole('heading', { name: 'Portal Beasiswa' })).toBeVisible();
  await expect(page.getByText('26 dari 26 beasiswa ditampilkan')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'KIP Kuliah', exact: true })).toBeVisible();
  await expect(page.getByText('Terakhir dicek: 21 Juni 2026').first()).toBeVisible();
  const kipCard = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'KIP Kuliah', exact: true }) });
  await expect(kipCard.getByRole('link', { name: /Resmi/ })).toHaveAttribute('href', 'https://kip-kuliah.kemdiktisaintek.go.id/');
  await expect(page.getByRole('heading', { name: 'Beasiswa BCA PPBP/PPTI' })).toBeVisible();
  await page.getByPlaceholder('Cari nama, penyelenggara, atau kecocokan...').fill('MEXT');
  await expect(page.getByRole('heading', { name: 'MEXT Undergraduate / Gakubu' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'KIP Kuliah', exact: true })).toHaveCount(0);
  await page.getByPlaceholder('Cari nama, penyelenggara, atau kecocokan...').fill('tidak-ada-beasiswa-ini');
  await expect(page.getByRole('heading', { name: 'Tidak ada beasiswa yang cocok' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset filter' }).click();
  await expect(page.getByRole('heading', { name: 'KIP Kuliah', exact: true })).toBeVisible();

  await page.route('**/api/student/programs/smart-financial/portfolio', (route) => route.fulfill({
    json: {
      student: { name: 'Nadia', nisn: '0011', className: 'XII IPA 2', schoolName: 'SMA Nusantara' },
      program: { title: 'Smart Financial', completedCount: 2, totalModules: 4 },
      modules: [
        { id: 'sf1', slug: 'identitas-dan-target', title: 'Identitas dan Target', order: 1, status: 'completed', data: { afterGraduationTarget: 'Kuliah di luar kota' } },
      ],
    },
  }));

  await page.goto('/app/programs/smart-financial/portfolio');
  await expect(page.getByRole('link', { name: /Unduh PDF/ })).toHaveAttribute('href', '/api/student/programs/smart-financial/portfolio.pdf');
});

test('student home dashboard highlights the grade recommended program', async ({ page }) => {
  await mockStudent(page);
  await page.route('**/api/student/programs/home', (route) => route.fulfill({
    json: {
      student: { name: 'Nadia', className: 'XII IPA 2', grade: 12, schoolName: 'SMA Nusantara' },
      recommendedProgram: {
        pathSlug: 'smart-financial',
        title: 'Smart Financial',
        gradeLabel: 'Kelas XII',
        theme: 'Latih keputusan finansial sebelum hidup mandiri setelah lulus.',
        accent: '#b45309',
        portfolioPath: '/app/programs/smart-financial/portfolio',
      },
      program: {
        slug: 'smart-financial',
        title: 'Smart Financial',
        description: 'Simulasi finansial.',
        progressPercentage: 25,
        completedCount: 1,
        totalModules: 4,
        currentModuleSlug: 'simulasi-financial-readiness',
        modules: [
          { id: 'sf1', slug: 'identitas-dan-target', title: 'Identitas dan Target', order: 1, status: 'completed', completedAt: null },
          { id: 'sf3', slug: 'simulasi-financial-readiness', title: 'Future Ready Board', order: 3, status: 'in_progress', completedAt: null },
        ],
      },
    },
  }));

  await page.goto('/app');
  await expect(page.getByRole('heading', { name: 'Lanjutkan Smart Financial-mu.' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Lanjutkan modul/ })).toHaveAttribute('href', '/app/programs/smart-financial/modules/simulasi-financial-readiness');
  await expect(page.getByText('Program utama: Kelas XII')).toBeVisible();
  await expect(page.getByText('Utama', { exact: true })).toBeVisible();
});

test('chatbot blocks sensitive student identifiers in the client', async ({ page }) => {
  await mockStudent(page);
  await page.route('**/api/student/programs/home', (route) => route.fulfill({
    json: {
      student: { name: 'Nadia', className: 'X-1', grade: 10, schoolName: 'SMA Nusantara' },
      recommendedProgram: {
        pathSlug: 'bekal-10',
        title: 'Bekal 10',
        gradeLabel: 'Kelas X',
        theme: 'Demo',
        accent: '#5b21b6',
        portfolioPath: '/app/portfolio',
      },
      program: { slug: 'bekal-10', title: 'Bekal 10', description: 'Demo', progressPercentage: 0, completedCount: 0, totalModules: 7, currentModuleSlug: null, modules: [] },
    },
  }));

  await page.goto('/app');
  await page.getByTitle('Buka Chatbot BK').click();
  await page.getByRole('button', { name: 'Saya paham dan lanjut' }).click();
  await page.getByPlaceholder('Tulis pertanyaan umum...').fill('nomor wa saya 0812-3456-7890, bagaimana belajar?');
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
