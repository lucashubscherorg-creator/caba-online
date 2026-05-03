// ============================================================
// EVENTS ROUTES — CABA ONLINE
// ============================================================
import { Router } from 'express';
import {
  listActiveEvents,
  getEvent,
  listEventsByNeighborhood,
  createManualEvent,
} from './events.controller';

const router = Router();

// GET /api/events
router.get('/', listActiveEvents);

// GET /api/events/neighborhood/:id  — must be before /:id to avoid param collision
router.get('/neighborhood/:id', listEventsByNeighborhood);

// GET /api/events/:id
router.get('/:id', getEvent);

// POST /api/events  (admin only — guarded inside controller)
router.post('/', createManualEvent);

export default router;
