import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { apiRateLimit } from '../../middleware/security';
import * as rolesController from './roles.controller';

const router = Router();

router.use(apiRateLimit);

router.get('/', rolesController.listRoles);
router.get('/available', authenticate, rolesController.getAvailableRoles);
router.get('/:id', rolesController.getRoleByIdHandler);
router.post('/select', authenticate, rolesController.selectRole);

export default router;
