import prisma from '../prisma';
import { BoxerStatus } from '@prisma/client';

const publicSelect = {
  id: true, firstName: true, lastName: true, dateOfBirth: true,
  currentRating: true, status: true, suspendReason: true, photoUrl: true,
  club: { select: { id: true, name: true, location: true } },
  weightClass: { select: { id: true, name: true } },
};

async function assertPromoterOwnsClub(clubId: number, promoterId: number) {
  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) throw Object.assign(new Error('Klub ne obstaja.'), { status: 404 });
  if (club.promoterId !== promoterId) {
    throw Object.assign(new Error('Nimate dovoljenja za boksarje tega kluba.'), { status: 403 });
  }
}

export async function create(data: {
  firstName: string; lastName: string; dateOfBirth: Date;
  clubId: number; weightClassId: number; promoterId: number;
}) {
  await assertPromoterOwnsClub(data.clubId, data.promoterId);
  const wc = await prisma.weightClass.findUnique({ where: { id: data.weightClassId } });
  if (!wc) throw Object.assign(new Error('Kategorija teže ne obstaja.'), { status: 404 });

  return prisma.boxer.create({
    data: {
      firstName: data.firstName, lastName: data.lastName,
      dateOfBirth: data.dateOfBirth, clubId: data.clubId,
      weightClassId: data.weightClassId,
    },
    select: publicSelect,
  });
}

export async function getById(id: number) {
  const boxer = await prisma.boxer.findUnique({ where: { id }, select: publicSelect });
  if (!boxer) throw Object.assign(new Error('Boksar ne obstaja.'), { status: 404 });
  return boxer;
}

export async function update(id: number, promoterId: number, data: {
  firstName?: string; lastName?: string; dateOfBirth?: Date;
  weightClassId?: number; photoUrl?: string;
}) {
  const boxer = await prisma.boxer.findUnique({ where: { id } });
  if (!boxer) throw Object.assign(new Error('Boksar ne obstaja.'), { status: 404 });
  await assertPromoterOwnsClub(boxer.clubId, promoterId);

  if (data.weightClassId) {
    const wc = await prisma.weightClass.findUnique({ where: { id: data.weightClassId } });
    if (!wc) throw Object.assign(new Error('Kategorija teže ne obstaja.'), { status: 404 });
  }

  return prisma.boxer.update({ where: { id }, data, select: publicSelect });
}

export async function suspend(id: number, reason: string) {
  const boxer = await prisma.boxer.findUnique({ where: { id } });
  if (!boxer) throw Object.assign(new Error('Boksar ne obstaja.'), { status: 404 });
  return prisma.boxer.update({
    where: { id },
    data: { status: BoxerStatus.suspended, suspendReason: reason },
    select: publicSelect,
  });
}

export async function activate(id: number) {
  const boxer = await prisma.boxer.findUnique({ where: { id } });
  if (!boxer) throw Object.assign(new Error('Boksar ne obstaja.'), { status: 404 });
  return prisma.boxer.update({
    where: { id },
    data: { status: BoxerStatus.active, suspendReason: null },
    select: publicSelect,
  });
}

export async function search(params: {
  search?: string; weightClassId?: number; clubId?: number; page: number; limit: number;
}) {
  const where: any = {};
  if (params.search) {
    where.OR = [
      { firstName: { contains: params.search, mode: 'insensitive' } },
      { lastName: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.weightClassId) where.weightClassId = params.weightClassId;
  if (params.clubId) where.clubId = params.clubId;

  const [total, boxers] = await Promise.all([
    prisma.boxer.count({ where }),
    prisma.boxer.findMany({
      where,
      select: publicSelect,
      orderBy: { currentRating: 'desc' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
  ]);

  return { total, page: params.page, limit: params.limit, data: boxers };
}
