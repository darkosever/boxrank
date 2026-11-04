import prisma from '../prisma';

export async function getById(id: number) {
  const club = await prisma.club.findUnique({
    where: { id },
    include: { promoter: { select: { id: true, email: true } } },
  });
  if (!club) throw Object.assign(new Error('Klub ne obstaja.'), { status: 404 });
  return club;
}

export async function update(id: number, promoterId: number, name: string, location: string) {
  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) throw Object.assign(new Error('Klub ne obstaja.'), { status: 404 });
  if (club.promoterId !== promoterId) {
    throw Object.assign(new Error('Nimate dovoljenja za urejanje tega kluba.'), { status: 403 });
  }
  return prisma.club.update({ where: { id }, data: { name, location } });
}

export async function getBoxers(id: number, promoterId?: number) {
  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) throw Object.assign(new Error('Klub ne obstaja.'), { status: 404 });
  if (promoterId !== undefined && club.promoterId !== promoterId) {
    throw Object.assign(new Error('Nimate dostopa do tega kluba.'), { status: 403 });
  }
  return prisma.boxer.findMany({
    where: { clubId: id },
    select: {
      id: true, firstName: true, lastName: true,
      currentRating: true, status: true,
      weightClass: { select: { id: true, name: true } },
    },
    orderBy: { currentRating: 'desc' },
  });
}
