import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { FightResult, Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import * as svc from '../services/fight.service';

const router = Router();

const createSchema = z.object({
  boxer1Id: z.number().int().positive(),
  boxer2Id: z.number().int().positive(),
  eventId: z.number().int().positive(),
  date: z.string().datetime(),
  result: z.nativeEnum(FightResult),
  winnerId: z.number().int().positive().optional(),
});

// POST /fights – promotor
router.post('/', authenticate, requireRole(Role.promoter), async (req: Request, res: Response): Promise<void> => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }
  try {
    const fight = await svc.create({
      ...parsed.data,
      date: new Date(parsed.data.date),
      submittedById: req.user!.id,
      promoterId: req.user!.id,
    });
    res.status(201).json(fight);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// GET /fights/pending – admin
router.get('/pending', authenticate, requireRole(Role.admin), async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await svc.getPending());
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /fights/:id/confirm – admin
router.put('/:id/confirm', authenticate, requireRole(Role.admin), async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await svc.confirm(parseInt(req.params.id)));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// PUT /fights/:id/reject – admin
router.put('/:id/reject', authenticate, requireRole(Role.admin), async (req: Request, res: Response): Promise<void> => {
  const { reason } = req.body;
  if (!reason || typeof reason !== 'string') {
    res.status(400).json({ message: 'Razlog za zavrnitev je obvezen.' });
    return;
  }
  try {
    res.json(await svc.reject(parseInt(req.params.id), reason));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// GET /fights/boxer/:boxerId – javno (zgodovina dvobojev)
router.get('/boxer/:boxerId', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await svc.getByBoxer(parseInt(req.params.boxerId)));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

export default router;
