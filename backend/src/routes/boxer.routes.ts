import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import * as svc from '../services/boxer.service';

const router = Router();

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().datetime(),
  clubId: z.number().int().positive(),
  weightClassId: z.number().int().positive(),
});

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.string().datetime().optional(),
  weightClassId: z.number().int().positive().optional(),
  photoUrl: z.string().url().optional(),
});

// GET /boxers – iskanje in filtriranje (javno)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const search = typeof req.query.search === 'string' && req.query.search.length >= 3
    ? req.query.search : undefined;
  const weightClassId = req.query.weightClassId ? parseInt(req.query.weightClassId as string) : undefined;
  const clubId = req.query.clubId ? parseInt(req.query.clubId as string) : undefined;
  const page = req.query.page ? Math.max(1, parseInt(req.query.page as string)) : 1;
  const limit = 20;

  try {
    res.json(await svc.search({ search, weightClassId, clubId, page, limit }));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// POST /boxers – samo promotor
router.post('/', authenticate, requireRole(Role.promoter), async (req: Request, res: Response): Promise<void> => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }
  try {
    const boxer = await svc.create({
      ...parsed.data,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      promoterId: req.user!.id,
    });
    res.status(201).json(boxer);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// GET /boxers/:id – javno
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await svc.getById(parseInt(req.params.id)));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// PUT /boxers/:id – samo promotor
router.put('/:id', authenticate, requireRole(Role.promoter), async (req: Request, res: Response): Promise<void> => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }
  try {
    const data = {
      ...parsed.data,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : undefined,
    };
    res.json(await svc.update(parseInt(req.params.id), req.user!.id, data));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// PUT /boxers/:id/suspend – samo admin
router.put('/:id/suspend', authenticate, requireRole(Role.admin), async (req: Request, res: Response): Promise<void> => {
  const { reason } = req.body;
  if (!reason || typeof reason !== 'string') {
    res.status(400).json({ message: 'Razlog za suspenz je obvezen.' });
    return;
  }
  try {
    res.json(await svc.suspend(parseInt(req.params.id), reason));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// PUT /boxers/:id/activate – samo admin
router.put('/:id/activate', authenticate, requireRole(Role.admin), async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await svc.activate(parseInt(req.params.id)));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

export default router;
