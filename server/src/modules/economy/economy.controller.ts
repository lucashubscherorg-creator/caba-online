import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as economyService from './economy.service';
import { ValidationError, AppError } from '../../middleware/errorHandler';

const transactionSchema = z.object({
  amount: z.number(),
  type: z.enum(['income', 'expense', 'penalty', 'reward']),
  description: z.string().max(200),
});

export async function getState(_req: Request, res: Response) {
  res.json({ success: true, data: economyService.getEconomyState() });
}

export async function getLeaderboard(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await economyService.getLeaderboard();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    // Solo el propio usuario o admin puede ver el historial
    if (req.user!.id !== req.params.userId) {
      return next(new AppError('No autorizado', 403));
    }
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const offset = Number(req.query.offset) || 0;
    const data = await economyService.getTransactionHistory(req.params.userId, limit, offset);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createTransaction(req: Request, res: Response, next: NextFunction) {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError('Datos de transacción inválidos'));
  try {
    const result = await economyService.applyTransaction(
      req.user!.id,
      parsed.data.amount,
      parsed.data.type,
      parsed.data.description,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
