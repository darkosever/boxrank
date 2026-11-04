import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../prisma';

const SALT_ROUNDS = 10;

export async function register(email: string, password: string, role: Role) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw Object.assign(new Error('E-poštni naslov je že v uporabi.'), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash, role },
  });

  return { id: user.id, email: user.email, role: user.role };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) {
    throw Object.assign(new Error('Napačen e-poštni naslov ali geslo.'), { status: 401 });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' },
  );

  return { token, user: { id: user.id, email: user.email, role: user.role } };
}
