import { FightResult, FightStatus } from '@prisma/client';
import prisma from '../prisma';
import { calculateElo } from './rating.service';

const fightInclude = {
  boxer1: { select: { id: true, firstName: true, lastName: true, weightClassId: true, clubId: true } },
  boxer2: { select: { id: true, firstName: true, lastName: true, weightClassId: true, clubId: true } },
  winner: { select: { id: true, firstName: true, lastName: true } },
  event: { select: { id: true, name: true, date: true } },
};

export async function create(data: {
  boxer1Id: number; boxer2Id: number; eventId: number;
  date: Date; result: FightResult; winnerId?: number;
  submittedById: number; promoterId: number;
}) {
  const [boxer1, boxer2] = await Promise.all([
    prisma.boxer.findUnique({ where: { id: data.boxer1Id } }),
    prisma.boxer.findUnique({ where: { id: data.boxer2Id } }),
  ]);

  if (!boxer1 || !boxer2) {
    throw Object.assign(new Error('Eden ali oba boksarja ne obstajata.'), { status: 404 });
  }

  // Promotor mora imeti vsaj enega boksarja iz svojega kluba
  const promoterClub = await prisma.club.findUnique({ where: { promoterId: data.promoterId } });
  if (!promoterClub || (boxer1.clubId !== promoterClub.id && boxer2.clubId !== promoterClub.id)) {
    throw Object.assign(new Error('Vsaj en boksar mora biti iz vašega kluba.'), { status: 403 });
  }

  // Oba morata biti v isti kategoriji teže
  if (boxer1.weightClassId !== boxer2.weightClassId) {
    throw Object.assign(new Error('Oba boksarja morata biti v isti kategoriji teže.'), { status: 422 });
  }

  // Suspendiran boksar ne more nastopiti
  if (boxer1.status === 'suspended' || boxer2.status === 'suspended') {
    throw Object.assign(new Error('Suspendiran boksar ne more nastopiti v dvoboju.'), { status: 422 });
  }

  // Pri neodločenem ni zmagovalca
  if (data.result === FightResult.draw && data.winnerId) {
    throw Object.assign(new Error('Pri neodločenem izidu ne sme biti zmagovalca.'), { status: 400 });
  }
  if (data.result !== FightResult.draw && !data.winnerId) {
    throw Object.assign(new Error('Zmagovalec je obvezen pri tem izidu.'), { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: data.eventId } });
  if (!event) throw Object.assign(new Error('Dogodek ne obstaja.'), { status: 404 });

  return prisma.fight.create({
    data: {
      boxer1Id: data.boxer1Id, boxer2Id: data.boxer2Id,
      eventId: data.eventId, date: data.date,
      result: data.result, winnerId: data.winnerId ?? null,
      submittedById: data.submittedById,
    },
    include: fightInclude,
  });
}

export async function getPending() {
  return prisma.fight.findMany({
    where: { status: FightStatus.pending },
    include: fightInclude,
    orderBy: { createdAt: 'asc' },
  });
}

export async function confirm(id: number) {
  const fight = await prisma.fight.findUnique({ where: { id }, include: fightInclude });
  if (!fight) throw Object.assign(new Error('Dvoboj ne obstaja.'), { status: 404 });
  if (fight.status !== FightStatus.pending) {
    throw Object.assign(new Error('Samo dvoboje v statusu pending je mogoče potrditi.'), { status: 409 });
  }

  const [boxer1, boxer2] = await Promise.all([
    prisma.boxer.findUnique({ where: { id: fight.boxer1Id } }),
    prisma.boxer.findUnique({ where: { id: fight.boxer2Id } }),
  ]);

  if (!boxer1 || !boxer2) throw Object.assign(new Error('Boksarja ne obstajata.'), { status: 404 });

  const elo1 = calculateElo(boxer1.currentRating, boxer2.currentRating,
    fight.winnerId === boxer1.id ? 'win' : fight.result === FightResult.draw ? 'draw' : 'loss');
  const elo2 = calculateElo(boxer2.currentRating, boxer1.currentRating,
    fight.winnerId === boxer2.id ? 'win' : fight.result === FightResult.draw ? 'draw' : 'loss');

  return prisma.$transaction(async (tx) => {
    await tx.boxer.update({ where: { id: boxer1.id }, data: { currentRating: elo1.newRating } });
    await tx.boxer.update({ where: { id: boxer2.id }, data: { currentRating: elo2.newRating } });

    await tx.ratingHistory.createMany({
      data: [
        { boxerId: boxer1.id, fightId: id, ratingBefore: elo1.ratingBefore, ratingAfter: elo1.newRating },
        { boxerId: boxer2.id, fightId: id, ratingBefore: elo2.ratingBefore, ratingAfter: elo2.newRating },
      ],
    });

    return tx.fight.update({
      where: { id },
      data: { status: FightStatus.confirmed },
      include: fightInclude,
    });
  });
}

export async function reject(id: number, reason: string) {
  const fight = await prisma.fight.findUnique({ where: { id } });
  if (!fight) throw Object.assign(new Error('Dvoboj ne obstaja.'), { status: 404 });
  if (fight.status !== FightStatus.pending) {
    throw Object.assign(new Error('Samo dvoboje v statusu pending je mogoče zavrniti.'), { status: 409 });
  }

  return prisma.fight.update({
    where: { id },
    data: { status: FightStatus.rejected, rejectReason: reason },
    include: fightInclude,
  });
}

export async function getByBoxer(boxerId: number) {
  const fights = await prisma.fight.findMany({
    where: {
      status: FightStatus.confirmed,
      OR: [{ boxer1Id: boxerId }, { boxer2Id: boxerId }],
    },
    include: fightInclude,
    orderBy: { date: 'desc' },
  });

  const summary = fights.reduce(
    (acc, f) => {
      if (f.result === FightResult.draw) acc.draws++;
      else if (f.winnerId === boxerId) acc.wins++;
      else acc.losses++;
      return acc;
    },
    { wins: 0, losses: 0, draws: 0 },
  );

  return { summary, fights };
}
