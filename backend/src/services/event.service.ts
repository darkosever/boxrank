import prisma from '../prisma';

export async function getAll() {
  return prisma.event.findMany({ orderBy: { date: 'desc' } });
}

export async function getById(id: number) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      fights: {
        include: {
          boxer1: { select: { id: true, firstName: true, lastName: true } },
          boxer2: { select: { id: true, firstName: true, lastName: true } },
          winner: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { date: 'asc' },
      },
    },
  });
  if (!event) throw Object.assign(new Error('Dogodek ne obstaja.'), { status: 404 });
  return event;
}

export async function create(name: string, date: Date, location: string) {
  return prisma.event.create({ data: { name, date, location } });
}
