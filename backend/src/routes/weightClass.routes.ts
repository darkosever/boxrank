import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import * as svc from '../services/weightClass.service';

const router = Router();

const bodySchema = z.object({
  name: z.string().min(1),
  minWeight: z.number().positive(),
  maxWeight: z.number().positive(),
}).refine((d) => d.maxWeight > d.minWeight, {
  message: 'maxWeight mora biti večji od minWeight.',
});

// GET /weight-classes – javno
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await svc.getAll());
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /weight-classes – samo admin
router.post('/', authenticate, requireRole(Role.admin), async (req: Request, res: Response): Promise<void> => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }
  try {
    const wc = await svc.create(parsed.data.name, parsed.data.minWeight, parsed.data.maxWeight);
    res.status(201).json(wc);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// PUT /weight-classes/:id – samo admin
router.put('/:id', authenticate, requireRole(Role.admin), async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }
  try {
    const wc = await svc.update(id, parsed.data.name, parsed.data.minWeight, parsed.data.maxWeight);
    res.json(wc);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// DELETE /weight-classes/:id – samo admin
router.delete('/:id', authenticate, requireRole(Role.admin), async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  try {
    await svc.remove(id);
    res.status(204).send();
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

export default router;
