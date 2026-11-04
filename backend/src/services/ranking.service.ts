import prisma from '../prisma';

export async function getRankings(weightClassId: number, page: number, limit: number) {
  const wc = await prisma.weightClass.findUnique({ where: { id: weightClassId } });
  if (!wc) throw Object.assign(new Error('Kategorija teže ne obstaja.'), { status: 404 });

  const [total, boxers] = await Promise.all([
    prisma.boxer.count({ where: { weightClassId } }),
    prisma.boxer.findMany({
      where: { weightClassId },
      select: {
        id: true, firstName: true, lastName: true,
        currentRating: true, status: true,
        club: { select: { id: true, name: true } },
      },
      orderBy: { currentRating: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const ranked = boxers.map((b, i) => ({
    rank: (page - 1) * limit + i + 1,
    ...b,
  }));

  return { weightClass: wc, total, page, limit, data: ranked };
}

export async function getSuggestedOpponents(boxerId: number) {
  const boxer = await prisma.boxer.findUnique({
    where: { id: boxerId },
    select: { id: true, weightClassId: true, currentRating: true },
  });
  if (!boxer) throw Object.assign(new Error('Boksar ne obstaja.'), { status: 404 });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const candidates = await prisma.boxer.findMany({
    where: {
      id: { not: boxerId },
      weightClassId: boxer.weightClassId,
      status: 'active',
    },
    select: {
      id: true, firstName: true, lastName: true,
      currentRating: true, status: true,
      club: { select: { id: true, name: true } },
      fightsAsBoxer1: {
        where: { status: 'confirmed', date: { gte: thirtyDaysAgo } },
        select: { date: true },
        orderBy: { date: 'desc' },
        take: 1,
      },
      fightsAsBoxer2: {
        where: { status: 'confirmed', date: { gte: thirtyDaysAgo } },
        select: { date: true },
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  });

  const withMeta = candidates.map((c) => {
    const lastFight = [...c.fightsAsBoxer1, ...c.fightsAsBoxer2]
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      currentRating: c.currentRating,
      club: c.club,
      ratingDiff: Math.abs(c.currentRating - boxer.currentRating),
      recentFightDate: lastFight?.date ?? null,
    };
  });

  return withMeta
    .sort((a, b) => a.ratingDiff - b.ratingDiff)
    .slice(0, 10);
}

export async function getRatingHistory(boxerId: number) {
  const boxer = await prisma.boxer.findUnique({ where: { id: boxerId } });
  if (!boxer) throw Object.assign(new Error('Boksar ne obstaja.'), { status: 404 });

  return prisma.ratingHistory.findMany({
    where: { boxerId },
    include: {
      fight: {
        select: {
          date: true, result: true,
          boxer1: { select: { id: true, firstName: true, lastName: true } },
          boxer2: { select: { id: true, firstName: true, lastName: true } },
          winner: { select: { id: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}
