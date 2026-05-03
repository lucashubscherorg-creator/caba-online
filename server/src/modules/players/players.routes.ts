import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { apiRateLimit } from '../../middleware/security';
import { getOnlinePlayers, updatePosition } from './players.controller';

const router = Router();
router.use(apiRateLimit);

router.get('/online', getOnlinePlayers);
router.patch('/position', authenticate, updatePosition);

export default router;
