import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import * as svc from '../services/event.service';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
  location: z.string().min(1),
});

// GET /events – javno
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await svc.getAll());
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /events/:id – javno
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await svc.getById(parseInt(req.params.id)));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// POST /events – admin ali promotor
router.post('/', authenticate, requireRole(Role.admin, Role.promoter), async (req: Request, res: Response): Promise<void> => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }
  try {
    const event = await svc.create(parsed.data.name, new Date(parsed.data.date), parsed.data.location);
    res.status(201).json(event);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

export default router;
