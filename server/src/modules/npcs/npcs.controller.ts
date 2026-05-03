// ============================================================
// NPC CONTROLLER — CABA ONLINE
// ============================================================
import { Request, Response } from 'express';
import { z } from 'zod';
import {
  getAllNPCs,
  getNPCsForNeighborhood,
  interactWithNPC,
} from './npcs.service';
import type { ApiResponse } from '../../../../shared/types';

// ─────────────────────────────────────────────────────────────
// GET /api/npcs
// ─────────────────────────────────────────────────────────────
export async function listNPCs(
  _req: Request,
  res: Response<ApiResponse>,
): Promise<void> {
  const npcs = await getAllNPCs();
  res.json({ success: true, data: npcs });
}

// ─────────────────────────────────────────────────────────────
// GET /api/npcs/neighborhood/:id
// ─────────────────────────────────────────────────────────────
export async function listNPCsByNeighborhood(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
): Promise<void> {
  const npcs = await getNPCsForNeighborhood(req.params.id);
  res.json({ success: true, data: npcs });
}

// ─────────────────────────────────────────────────────────────
// POST /api/npcs/:id/interact  (requires auth)
// ─────────────────────────────────────────────────────────────
const InteractSchema = z.object({
  interactionId: z.string().min(1).max(100),
});

export async function interact(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
): Promise<void> {
  // userId is attached by auth middleware
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const parsed = InteractSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: 'Missing or invalid interactionId',
      data: parsed.error.errors,
    });
    return;
  }

  const result = await interactWithNPC(userId, req.params.id, parsed.data.interactionId);
  const status = result.success ? 200 : 400;
  res.status(status).json({ success: result.success, data: result, message: result.message });
}
