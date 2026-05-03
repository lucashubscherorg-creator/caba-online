import { Router } from 'express';
import * as worldController from './world.controller';
import { optionalAuth } from '../../middleware/auth';
import { apiRateLimit } from '../../middleware/security';

const router = Router();

// Apply API rate limit to all world routes
router.use(apiRateLimit);

/**
 * GET /api/world/neighborhoods
 * Returns all neighborhoods with current player count and indexes.
 * Public, but enriched for authenticated users (future).
 */
router.get('/neighborhoods', optionalAuth, worldController.getNeighborhoods);

/**
 * GET /api/world/events
 * Returns currently active world events.
 */
router.get('/events', optionalAuth, worldController.getEvents);

/**
 * GET /api/world/players
 * Returns online players with position, username, and role.
 */
router.get('/players', optionalAuth, worldController.getOnlinePlayers);

/**
 * GET /api/world/state
 * Full world snapshot for initial game load: neighborhoods + events + players.
 */
router.get('/state', optionalAuth, worldController.getWorldState);

export default router;
