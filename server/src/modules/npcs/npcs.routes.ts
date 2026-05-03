// ============================================================
// NPC ROUTES — CABA ONLINE
// ============================================================
import { Router } from 'express';
import { listNPCs, listNPCsByNeighborhood, interact } from './npcs.controller';
import { authenticate as authMiddleware } from '../../middleware/auth';

const router = Router();

// GET /api/npcs
router.get('/', listNPCs);

// GET /api/npcs/neighborhood/:id
router.get('/neighborhood/:id', listNPCsByNeighborhood);

// POST /api/npcs/:id/interact — requires auth
router.post('/:id/interact', authMiddleware, interact);

export default router;
