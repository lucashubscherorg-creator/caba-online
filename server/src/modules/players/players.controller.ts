import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import { logger } from '../../config/logger';

export async function getOnlinePlayers(req: Request, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role_id, level, reputation, balance, neighborhood, position_lat, position_lng, is_online')
      .eq('is_online', true)
      .limit(100);

    if (error) throw error;

    const players = (data ?? []).map((u) => ({
      id: u.id,
      username: u.username,
      roleId: u.role_id,
      level: u.level,
      reputation: u.reputation,
      balance: u.balance,
      neighborhoodId: u.neighborhood,
      isOnline: u.is_online,
      position: {
        lat: u.position_lat ?? -34.6037,
        lng: u.position_lng ?? -58.3816,
      },
    }));

    res.json({ success: true, data: players });
  } catch (err) {
    logger.error('getOnlinePlayers error', { error: err });
    res.json({ success: true, data: [] }); // Fail gracefully — non-critical
  }
}

export async function updatePosition(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { lat, lng } = req.body as { lat: number; lng: number };

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({ success: false, error: 'Coordenadas inválidas' });
      return;
    }

    // Validate inside CABA bounds
    if (lat < -34.71 || lat > -34.52 || lng < -58.54 || lng > -58.33) {
      res.status(400).json({ success: false, error: 'Posición fuera de CABA' });
      return;
    }

    await supabase
      .from('users')
      .update({ position_lat: lat, position_lng: lng })
      .eq('id', userId);

    res.json({ success: true });
  } catch (err) {
    logger.error('updatePosition error', { error: err });
    res.status(500).json({ success: false, error: 'Error al actualizar posición' });
  }
}
