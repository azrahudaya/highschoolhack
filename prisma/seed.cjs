const { PrismaClient, ProgramSlug, UserRole } = require('@prisma/client');

const prisma = new PrismaClient();

const programs = [
  {
    slug: ProgramSlug.bekal_10,
    title: 'Bekal 10',
    grade: 10,
    description: 'Adaptasi SMA, pengenalan potensi diri, target akademik, dan portofolio perkembangan awal.',
    modules: [
      'Langkah Awalku di SMA',
      'Mengenal Diriku Lebih Dekat',
      'Vision Board SMA-ku',
      'Target Pengembangan Diri',
      'Belajar dari Perjalanan',
      'Merancang Target Prestasi',
      'Komitmen Akademikku',
    ],
  },
  {
    slug: ProgramSlug.setting_goal,
    title: 'Setting Goal',
    grade: 11,
    description: 'Eksplorasi program studi dan karier, SMART goals, rencana aksi, dan refleksi berkala.',
    modules: [
      'Kenali Diriku',
      'Eksplorasi Program Studi',
      'Eksplorasi Karier',
      'Mata Pelajaran Pendukung',
      'Goal Setting',
      'Rencana Aksi',
      'Dashboard Perkembangan',
      'Refleksi',
    ],
  },
  {
    slug: ProgramSlug.smart_financial,
    title: 'Smart Financial',
    grade: 12,
    description: 'Simulasi finansial, beasiswa, financial readiness score, dan dashboard kesiapan.',
    modules: [
      'Identitas dan Target',
      'Pilih Kota Tujuan',
      { title: 'Future Ready Board', slug: 'simulasi-financial-readiness' },
      'Hasil dan Rekomendasi',
    ],
  },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function gradeFromClassName(className) {
  if (className.startsWith('XII')) return 12;
  if (className.startsWith('XI')) return 11;
  return 10;
}

async function main() {
  const school = await prisma.school.upsert({
    where: { slug: 'sma-nusantara-demo' },
    update: {},
    create: {
      name: 'SMA Nusantara Demo',
      slug: 'sma-nusantara-demo',
      joinCode: 'HSH-DEMO',
    },
  });

  for (const className of ['X-1', 'XI-1', 'XII-1']) {
    await prisma.schoolClass.upsert({
      where: {
        schoolId_name: {
          schoolId: school.id,
          name: className,
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        name: className,
        grade: gradeFromClassName(className),
      },
    });
  }

  const admin = await prisma.user.upsert({
    where: { email: 'admin@highschoolhack.local' },
    update: { name: 'HighschoolHack Admin' },
    create: {
      email: 'admin@highschoolhack.local',
      name: 'HighschoolHack Admin',
    },
  });

  await prisma.schoolMembership.upsert({
    where: {
      userId_schoolId_role: {
        userId: admin.id,
        schoolId: school.id,
        role: UserRole.super_admin,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      schoolId: school.id,
      role: UserRole.super_admin,
    },
  });

  for (const programSeed of programs) {
    const program = await prisma.program.upsert({
      where: { slug: programSeed.slug },
      update: {
        title: programSeed.title,
        grade: programSeed.grade,
        description: programSeed.description,
      },
      create: {
        slug: programSeed.slug,
        title: programSeed.title,
        grade: programSeed.grade,
        description: programSeed.description,
      },
    });

    for (const [index, moduleSeed] of programSeed.modules.entries()) {
      const moduleTitle = typeof moduleSeed === 'string' ? moduleSeed : moduleSeed.title;
      const moduleSlug = typeof moduleSeed === 'string' ? slugify(moduleSeed) : moduleSeed.slug;
      await prisma.programModule.upsert({
        where: {
          programId_order: {
            programId: program.id,
            order: index + 1,
          },
        },
        update: {
          title: moduleTitle,
          slug: moduleSlug,
        },
        create: {
          programId: program.id,
          title: moduleTitle,
          slug: moduleSlug,
          order: index + 1,
        },
      });
    }
  }

  console.log('Seed selesai. Sekolah demo: SMA Nusantara Demo (slug: sma-nusantara-demo)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
