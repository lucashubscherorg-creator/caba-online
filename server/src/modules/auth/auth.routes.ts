import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { authRateLimit } from '../../middleware/security';

const router = Router();

/**
 * POST /api/auth/register
 * Body: { username, email, password }
 * Returns: { user, accessToken, refreshToken, expiresIn }
 */
router.post('/register', authRateLimit, authController.register);

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { user, accessToken, refreshToken, expiresIn }
 */
router.post('/login', authRateLimit, authController.login);

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 * Returns: { accessToken, expiresIn }
 */
router.post('/refresh', authRateLimit, authController.refresh);

/**
 * POST /api/auth/logout
 * Header: Authorization: Bearer <accessToken>
 * Invalidates all refresh tokens for the user.
 */
router.post('/logout', authenticate, authController.logout);

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <accessToken>
 * Returns: { user }
 */
router.get('/me', authenticate, authController.me);

export default router;
