import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as missionsService from './missions.service';
import { ValidationError } from '../../middleware/errorHandler';

export async function getActive(req: Request, res: Response, next: NextFunction) {
  try {
    const missions = await missionsService.getActiveMissions(req.user!.id);
    res.json({ success: true, data: missions });
  } catch (err) { next(err); }
}

export async function generate(req: Request, res: Response, next: NextFunction) {
  try {
    const mission = await missionsService.generateForUser(req.user!.id);
    res.json({ success: true, data: mission });
  } catch (err) { next(err); }
}

export async function generateGroup(req: Request, res: Response, next: NextFunction) {
  const schema = z.object({ userIds: z.array(z.string()).min(2).max(10) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError('Se necesitan entre 2 y 10 usuarios'));
  try {
    const mission = await missionsService.generateGroupMission(parsed.data.userIds);
    res.json({ success: true, data: mission });
  } catch (err) { next(err); }
}

export async function accept(req: Request, res: Response, next: NextFunction) {
  try {
    const mission = await missionsService.acceptMission(req.user!.id, req.params.id);
    res.json({ success: true, data: mission });
  } catch (err) { next(err); }
}

export async function completeStep(req: Request, res: Response, next: NextFunction) {
  try {
    const mission = await missionsService.completeMissionStep(
      req.user!.id, req.params.id, req.params.stepId
    );
    res.json({ success: true, data: mission });
  } catch (err) { next(err); }
}

export async function abandon(req: Request, res: Response, next: NextFunction) {
  try {
    await missionsService.abandonMission(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Misión abandonada' });
  } catch (err) { next(err); }
}
