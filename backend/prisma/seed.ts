import { PrismaClient, Role, BoxerStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@boxrank.si' },
    update: {},
    create: {
      email: 'admin@boxrank.si',
      passwordHash: await hash('admin1234'),
      role: Role.admin,
    },
  });

  // Promotorja
  const promoter1 = await prisma.user.upsert({
    where: { email: 'promotor1@boxrank.si' },
    update: {},
    create: {
      email: 'promotor1@boxrank.si',
      passwordHash: await hash('promotor1234'),
      role: Role.promoter,
    },
  });

  const promoter2 = await prisma.user.upsert({
    where: { email: 'promotor2@boxrank.si' },
    update: {},
    create: {
      email: 'promotor2@boxrank.si',
      passwordHash: await hash('promotor1234'),
      role: Role.promoter,
    },
  });

  // Kluba
  const club1 = await prisma.club.upsert({
    where: { promoterId: promoter1.id },
    update: {},
    create: { name: 'BK Maribor', location: 'Maribor', promoterId: promoter1.id },
  });

  const club2 = await prisma.club.upsert({
    where: { promoterId: promoter2.id },
    update: {},
    create: { name: 'BK Ljubljana', location: 'Ljubljana', promoterId: promoter2.id },
  });

  // Kategorije teže
  const lightweight = await prisma.weightClass.upsert({
    where: { name: 'Lahka kategorija' },
    update: {},
    create: { name: 'Lahka kategorija', minWeight: 57, maxWeight: 61 },
  });

  const middleweight = await prisma.weightClass.upsert({
    where: { name: 'Srednja kategorija' },
    update: {},
    create: { name: 'Srednja kategorija', minWeight: 69, maxWeight: 75 },
  });

  const heavyweight = await prisma.weightClass.upsert({
    where: { name: 'Težka kategorija' },
    update: {},
    create: { name: 'Težka kategorija', minWeight: 91, maxWeight: 999 },
  });

  // Boksarji – klub 1
  await prisma.boxer.createMany({
    skipDuplicates: true,
    data: [
      {
        firstName: 'Luka', lastName: 'Horvat', dateOfBirth: new Date('1998-03-15'),
        clubId: club1.id, weightClassId: lightweight.id, currentRating: 1120,
      },
      {
        firstName: 'Marko', lastName: 'Novak', dateOfBirth: new Date('2000-07-22'),
        clubId: club1.id, weightClassId: middleweight.id, currentRating: 980,
      },
      {
        firstName: 'Nejc', lastName: 'Kovač', dateOfBirth: new Date('1996-11-05'),
        clubId: club1.id, weightClassId: heavyweight.id, currentRating: 1050,
      },
    ],
  });

  // Boksarji – klub 2
  await prisma.boxer.createMany({
    skipDuplicates: true,
    data: [
      {
        firstName: 'Alen', lastName: 'Krajnc', dateOfBirth: new Date('1999-01-10'),
        clubId: club2.id, weightClassId: lightweight.id, currentRating: 1080,
      },
      {
        firstName: 'Blaž', lastName: 'Zupančič', dateOfBirth: new Date('2001-05-18'),
        clubId: club2.id, weightClassId: middleweight.id, currentRating: 1010,
      },
      {
        firstName: 'Rok', lastName: 'Stanovnik', dateOfBirth: new Date('1997-09-30'),
        clubId: club2.id, weightClassId: heavyweight.id, currentRating: 1150,
      },
    ],
  });

  console.log('Seed uspešen. Ustvarjeni: admin, 2 promotorja, 2 kluba, 3 kategorije, 6 boksarjev.');
  console.log('admin@boxrank.si / admin1234');
  console.log('promotor1@boxrank.si / promotor1234');
  console.log('promotor2@boxrank.si / promotor1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
