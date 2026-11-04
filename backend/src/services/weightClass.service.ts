import prisma from '../prisma';

async function checkOverlap(minWeight: number, maxWeight: number, excludeId?: number) {
  const classes = await prisma.weightClass.findMany({
    where: excludeId ? { id: { not: excludeId } } : undefined,
  });

  const overlaps = classes.some(
    (c) => minWeight < c.maxWeight && maxWeight > c.minWeight,
  );

  if (overlaps) {
    throw Object.assign(
      new Error('Razpon teže se prekriva z obstoječo kategorijo.'),
      { status: 409 },
    );
  }
}

export async function getAll() {
  return prisma.weightClass.findMany({ orderBy: { minWeight: 'asc' } });
}

export async function create(name: string, minWeight: number, maxWeight: number) {
  await checkOverlap(minWeight, maxWeight);
  return prisma.weightClass.create({ data: { name, minWeight, maxWeight } });
}

export async function update(id: number, name: string, minWeight: number, maxWeight: number) {
  await checkOverlap(minWeight, maxWeight, id);
  return prisma.weightClass.update({ where: { id }, data: { name, minWeight, maxWeight } });
}

export async function remove(id: number) {
  const boxerCount = await prisma.boxer.count({ where: { weightClassId: id } });
  if (boxerCount > 0) {
    throw Object.assign(
      new Error('Kategorije z dodeljenimi boksarji ni mogoče izbrisati.'),
      { status: 409 },
    );
  }
  return prisma.weightClass.delete({ where: { id } });
}
