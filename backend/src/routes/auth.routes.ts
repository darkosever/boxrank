import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import * as authService from '../services/auth.service';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Neveljaven e-poštni naslov.'),
  password: z.string().min(8, 'Geslo mora imeti vsaj 8 znakov.'),
  role: z.enum([Role.promoter, Role.boxer]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }

  try {
    const user = await authService.register(
      parsed.data.email,
      parsed.data.password,
      parsed.data.role,
    );
    res.status(201).json(user);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Neveljavni podatki.' });
    return;
  }

  try {
    const result = await authService.login(parsed.data.email, parsed.data.password);
    res.json(result);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

export default router;
