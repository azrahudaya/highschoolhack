const { PrismaClient, UserRole } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const [emailInput, schoolInput, ...nameParts] = process.argv.slice(2);
  const fullName = nameParts.join(' ').trim();

  if (!emailInput || !schoolInput || !fullName) {
    throw new Error('Gunakan: npm run teacher:assign -- email@sekolah.id slug-sekolah "Nama Guru"');
  }

  const email = emailInput.toLowerCase().trim();
  const schoolIdentifier = schoolInput.trim();
  const [user, school] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.school.findFirst({
      where: {
        OR: [
          { slug: schoolIdentifier.toLowerCase() },
          { name: { equals: schoolIdentifier, mode: 'insensitive' } },
          { joinCode: schoolIdentifier.toUpperCase() },
        ],
      },
    }),
  ]);

  if (!user) throw new Error('Akun guru belum tersedia. Minta guru register atau login Google terlebih dahulu.');
  if (!school) throw new Error('Sekolah tidak ditemukan. Gunakan slug atau nama sekolah yang terdaftar.');

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { name: fullName } }),
    prisma.schoolMembership.upsert({
      where: { userId_schoolId_role: { userId: user.id, schoolId: school.id, role: UserRole.teacher_bk } },
      update: {},
      create: { userId: user.id, schoolId: school.id, role: UserRole.teacher_bk },
    }),
    prisma.teacherProfile.upsert({
      where: { userId: user.id },
      update: { fullName },
      create: { userId: user.id, fullName },
    }),
  ]);

  console.log(`${fullName} sekarang menjadi Guru BK di ${school.name}.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
