const { PrismaClient, UserRole } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const [emailInput, joinCodeInput, ...nameParts] = process.argv.slice(2);
  const fullName = nameParts.join(' ').trim();

  if (!emailInput || !joinCodeInput || !fullName) {
    throw new Error('Gunakan: npm run teacher:assign -- email@sekolah.id KODE-SEKOLAH "Nama Guru"');
  }

  const email = emailInput.toLowerCase().trim();
  const joinCode = joinCodeInput.toUpperCase().trim();
  const [user, school] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.school.findUnique({ where: { joinCode } }),
  ]);

  if (!user) throw new Error('Akun guru belum tersedia. Minta guru register atau login Google terlebih dahulu.');
  if (!school) throw new Error('Kode sekolah tidak ditemukan.');

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
