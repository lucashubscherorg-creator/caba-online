import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { apiRateLimit } from '../../middleware/security';
import * as economyController from './economy.controller';

const router = Router();
router.use(apiRateLimit);

router.get('/state', economyController.getState);
router.get('/leaderboard', economyController.getLeaderboard);
router.get('/history/:userId', authenticate, economyController.getHistory);
router.post('/transaction', authenticate, economyController.createTransaction);

export default router;
