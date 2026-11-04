import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import * as svc from '../services/club.service';

const router = Router();

const updateSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
});

// GET /clubs/my – promotorjev lasten klub
router.get('/my', authenticate, requireRole(Role.promoter), async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await svc.getMyClub(req.user!.id));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// GET /clubs/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await svc.getById(parseInt(req.params.id)));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// PUT /clubs/:id – samo promotor
router.put('/:id', authenticate, requireRole(Role.promoter), async (req: Request, res: Response): Promise<void> => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }
  try {
    res.json(await svc.update(parseInt(req.params.id), req.user!.id, parsed.data.name, parsed.data.location));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// GET /clubs/:id/boxers
router.get('/:id/boxers', authenticate, requireRole(Role.promoter, Role.admin), async (req: Request, res: Response): Promise<void> => {
  const promoterId = req.user!.role === Role.promoter ? req.user!.id : undefined;
  try {
    res.json(await svc.getBoxers(parseInt(req.params.id), promoterId));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

export default router;
