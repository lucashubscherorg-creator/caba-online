import { Request, Response, NextFunction } from 'express';
import * as worldService from './world.service';

export async function getNeighborhoods(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const neighborhoods = await worldService.getNeighborhoods();
    res.status(200).json({ success: true, data: { neighborhoods } });
  } catch (err) {
    next(err);
  }
}

export async function getEvents(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const events = await worldService.getActiveEvents();
    res.status(200).json({ success: true, data: { events } });
  } catch (err) {
    next(err);
  }
}

export async function getOnlinePlayers(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const players = await worldService.getOnlinePlayers();
    res.status(200).json({ success: true, data: { players } });
  } catch (err) {
    next(err);
  }
}

export async function getWorldState(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const state = await worldService.getWorldState();
    res.status(200).json({ success: true, data: state });
  } catch (err) {
    next(err);
  }
}
