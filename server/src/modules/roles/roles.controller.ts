import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ROLES_DATA, getRoleById as findRoleById } from './roles.data';
import { supabase } from '../../config/supabase';
import { NotFoundError, ValidationError } from '../../middleware/errorHandler';
import { getIO } from '../../websockets/ioInstance';

const selectRoleSchema = z.object({ roleId: z.string().min(1) });

export async function listRoles(req: Request, res: Response) {
  const { category, legal } = req.query;
  let roles = [...ROLES_DATA];
  if (category) roles = roles.filter((r) => r.category === category);
  if (legal) roles = roles.filter((r) => r.legalStatus === legal);
  res.json({ success: true, data: roles, total: roles.length });
}

export async function getRoleByIdHandler(req: Request, res: Response, next: NextFunction) {
  const role = ROLES_DATA.find((r) => r.id === req.params.id);
  if (!role) return next(new NotFoundError('Rol'));
  res.json({ success: true, data: role });
}

export async function getAvailableRoles(req: Request, res: Response) {
  const level = req.user?.level ?? 1;
  const roles = ROLES_DATA.filter((r) => r.unlockLevel <= level);
  res.json({ success: true, data: roles });
}

export async function selectRole(req: Request, res: Response, next: NextFunction) {
  const parsed = selectRoleSchema.safeParse(req.body);
  if (!parsed.success) return next(new ValidationError('roleId requerido'));

  const { roleId } = parsed.data;
  const role = findRoleById(roleId);
  if (!role) return next(new NotFoundError('Rol'));

  const userLevel = req.user!.level;
  if (role.unlockLevel > userLevel) {
    return next(new ValidationError(`Necesitás nivel ${role.unlockLevel} para este rol`));
  }

  const { error } = await supabase
    .from('users')
    .update({ role_id: roleId, updated_at: new Date().toISOString() })
    .eq('id', req.user!.id);

  if (error) return next(error);

  // Notificar cambio de rol via WebSocket
  const io = getIO();
  if (io) {
    io.to(`user:${req.user!.id}`).emit('role:changed', { roleId, role });
  }

  res.json({ success: true, data: role, message: `Ahora sos ${role.name}` });
}
