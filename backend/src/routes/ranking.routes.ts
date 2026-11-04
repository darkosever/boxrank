import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';
import * as svc from '../services/ranking.service';

const router = Router();

// GET /rankings?weightClassId=1&page=1 – javno
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const weightClassId = parseInt(req.query.weightClassId as string);
  if (!weightClassId) {
    res.status(400).json({ message: 'weightClassId je obvezen parameter.' });
    return;
  }
  const page = req.query.page ? Math.max(1, parseInt(req.query.page as string)) : 1;
  const limit = 20;

  try {
    res.json(await svc.getRankings(weightClassId, page, limit));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// GET /rankings/suggestions/:boxerId – promotor ali boksar
router.get('/suggestions/:boxerId', authenticate, requireRole(Role.promoter, Role.boxer), async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await svc.getSuggestedOpponents(parseInt(req.params.boxerId)));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

// GET /rankings/history/:boxerId – javno
router.get('/history/:boxerId', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await svc.getRatingHistory(parseInt(req.params.boxerId)));
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
});

export default router;
