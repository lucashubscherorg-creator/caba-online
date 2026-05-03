// ============================================================
// EVENTS CONTROLLER — CABA ONLINE
// ============================================================
import { Request, Response } from 'express';
import { z } from 'zod';
import {
  getActiveEvents,
  getEventById,
  getActiveEventsForNeighborhood,
  createWorldEvent,
} from './eventsService';
import type { ApiResponse } from '../../../../shared/types';

// ── Zod schema for manual event creation ─────────────────────
const CreateEventSchema = z.object({
  type: z.enum([
    'marcha',
    'paro',
    'dolar_salto',
    'inflacion_pico',
    'evento_cultural',
    'operativo_policial',
    'corte_servicio',
    'crisis_economica',
    'elecciones',
    'noticia_real',
  ]),
  title:                 z.string().min(5).max(150),
  description:           z.string().min(10).max(500),
  affectedNeighborhoods: z.array(z.string()).min(1),
  economicImpact:        z.number().min(-100).max(100),
  safetyImpact:          z.number().min(-100).max(100),
  duration:              z.number().min(5).max(720),
  sourceNews:            z.string().url().optional(),
  iconEmoji:             z.string().max(4).optional(),
});

// ─────────────────────────────────────────────────────────────
// GET /api/events
// ─────────────────────────────────────────────────────────────
export async function listActiveEvents(
  _req: Request,
  res: Response<ApiResponse>,
): Promise<void> {
  const events = await getActiveEvents();
  res.json({ success: true, data: events });
}

// ─────────────────────────────────────────────────────────────
// GET /api/events/:id
// ─────────────────────────────────────────────────────────────
export async function getEvent(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
): Promise<void> {
  const event = await getEventById(req.params.id);
  if (!event) {
    res.status(404).json({ success: false, error: 'Event not found' });
    return;
  }
  res.json({ success: true, data: event });
}

// ─────────────────────────────────────────────────────────────
// GET /api/events/neighborhood/:id
// ─────────────────────────────────────────────────────────────
export async function listEventsByNeighborhood(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
): Promise<void> {
  const events = await getActiveEventsForNeighborhood(req.params.id);
  res.json({ success: true, data: events });
}

// ─────────────────────────────────────────────────────────────
// POST /api/events (admin only)
// ─────────────────────────────────────────────────────────────
export async function createManualEvent(
  req: Request,
  res: Response<ApiResponse>,
): Promise<void> {
  // Admin guard
  const adminSecret = req.headers['admin-secret'] ?? req.headers['x-admin-secret'];
  if (adminSecret !== process.env.ADMIN_SECRET) {
    res.status(403).json({ success: false, error: 'Forbidden' });
    return;
  }

  const parsed = CreateEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: 'Invalid event data',
      data: parsed.error.errors,
    });
    return;
  }

  try {
    const event = await createWorldEvent(parsed.data);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: (err as Error).message,
    });
  }
}
