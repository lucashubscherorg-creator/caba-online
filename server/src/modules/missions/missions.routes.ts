import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { apiRateLimit } from '../../middleware/security';
import * as missionsController from './missions.controller';

const router = Router();
router.use(apiRateLimit);
router.use(authenticate);

router.get('/active', missionsController.getActive);
router.post('/generate', missionsController.generate);
router.post('/group', missionsController.generateGroup);
router.post('/:id/accept', missionsController.accept);
router.post('/:id/step/:stepId', missionsController.completeStep);
router.post('/:id/abandon', missionsController.abandon);

export default router;
