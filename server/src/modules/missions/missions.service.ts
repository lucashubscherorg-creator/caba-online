import { supabase } from '../../config/supabase';
import { logger } from '../../config/logger';
import { generateMission, generateMultiUserMission } from '../../ai/missionGenerator';
import { applyTransaction } from '../economy/economy.service';
import { getIO } from '../../websockets/ioInstance';
import type { Mission } from '../../../../shared/types';
import type { MissionContext } from '../../ai/missionGenerator';
import { getEconomyState } from '../economy/economy.service';

function getTimeOfDay(): 'morning' | 'afternoon' | 'night' {
  const h = new Date().getHours();
  if (h >= 6 && h < 13) return 'morning';
  if (h >= 13 && h < 20) return 'afternoon';
  return 'night';
}

export async function generateForUser(userId: string): Promise<Mission> {
  // Obtener datos del usuario
  const { data: user, error } = await supabase
    .from('users')
    .select('role_id, neighborhood_id, level, skills, balance')
    .eq('id', userId)
    .single();

  if (error || !user) throw new Error('Usuario no encontrado');

  // Obtener eventos activos
  const { data: events } = await supabase
    .from('world_events')
    .select('type')
    .eq('is_active', true);

  const economy = getEconomyState();

  const context: MissionContext = {
    neighborhoodId: user.neighborhood_id as string,
    userRole: user.role_id as string,
    userLevel: user.level as number,
    userSkills: user.skills as any,
    userBalance: user.balance as number,
    activeEvents: (events ?? []).map((e: any) => e.type as string),
    timeOfDay: getTimeOfDay(),
    dollarRate: economy.dollarRate,
    inflationIndex: economy.inflationIndex,
    worldSafetyLevel: economy.safetyMultiplier * 5,
  };

  const mission = generateMission(userId, context);

  // Guardar en Supabase
  const { error: insertError } = await supabase.from('missions').insert({
    id: mission.id,
    title: mission.title,
    description: mission.description,
    type: mission.type,
    target_users: mission.targetUsers,
    location: mission.location,
    neighborhood_id: mission.neighborhoodId,
    reward: mission.reward,
    penalty: mission.penalty,
    time_limit: mission.timeLimit,
    difficulty: mission.difficulty,
    steps: mission.steps,
    status: 'pending',
    expires_at: mission.expiresAt,
    created_at: mission.createdAt,
  });

  if (insertError) {
    logger.error('Error saving mission', { error: insertError.message });
  }

  // Notificar al usuario via WebSocket
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit('mission:new', mission);
  }

  return mission;
}

export async function generateGroupMission(userIds: string[]): Promise<Mission> {
  if (userIds.length < 2) throw new Error('Se necesitan al menos 2 usuarios para misión grupal');

  const { data: firstUser } = await supabase
    .from('users')
    .select('role_id, neighborhood_id, level, skills, balance')
    .eq('id', userIds[0])
    .single();

  const { data: events } = await supabase
    .from('world_events')
    .select('type')
    .eq('is_active', true);

  const economy = getEconomyState();

  const context: MissionContext = {
    neighborhoodId: (firstUser as any)?.neighborhood_id ?? 'microcentro',
    userRole: (firstUser as any)?.role_id ?? 'sin_trabajo',
    userLevel: (firstUser as any)?.level ?? 1,
    userSkills: (firstUser as any)?.skills ?? {},
    userBalance: (firstUser as any)?.balance ?? 50000,
    activeEvents: (events ?? []).map((e: any) => e.type as string),
    timeOfDay: getTimeOfDay(),
    dollarRate: economy.dollarRate,
    inflationIndex: economy.inflationIndex,
    worldSafetyLevel: economy.safetyMultiplier * 5,
  };

  const mission = generateMultiUserMission(userIds, context);

  await supabase.from('missions').insert({
    id: mission.id,
    title: mission.title,
    description: mission.description,
    type: mission.type,
    target_users: mission.targetUsers,
    location: mission.location,
    neighborhood_id: mission.neighborhoodId,
    reward: mission.reward,
    penalty: mission.penalty,
    time_limit: mission.timeLimit,
    difficulty: mission.difficulty,
    steps: mission.steps,
    status: 'pending',
    expires_at: mission.expiresAt,
    created_at: mission.createdAt,
  });

  const io = getIO();
  if (io) {
    for (const uid of userIds) {
      io.to(`user:${uid}`).emit('mission:new', mission);
    }
  }

  return mission;
}

export async function getActiveMissions(userId: string): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .contains('target_users', [userId])
    .in('status', ['pending', 'active'])
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Mission[];
}

export async function completeMissionStep(
  userId: string,
  missionId: string,
  stepId: string
): Promise<Mission> {
  const { data: mission, error } = await supabase
    .from('missions')
    .select('*')
    .eq('id', missionId)
    .single();

  if (error || !mission) throw new Error('Misión no encontrada');
  if (!(mission.target_users as string[]).includes(userId)) {
    throw new Error('No tenés acceso a esta misión');
  }

  const steps = (mission.steps as any[]).map((s: any) =>
    s.id === stepId ? { ...s, completed: true } : s
  );

  const allCompleted = steps.every((s: any) => s.completed);
  const newStatus = allCompleted ? 'completed' : 'active';

  const { error: updateError } = await supabase
    .from('missions')
    .update({ steps, status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', missionId);

  if (updateError) throw updateError;

  // Si se completó toda la misión, aplicar recompensa
  if (allCompleted) {
    const reward = mission.reward as any;
    await applyTransaction(userId, reward.money, 'reward', `Recompensa: ${mission.title}`);

    // Actualizar reputación
    try {
      await supabase.rpc('increment_reputation', {
        user_id: userId,
        amount: reward.reputation ?? 0,
      });
    } catch { /* RPC opcional */ }

    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('mission:completed', { missionId, reward });
    }
  }

  return { ...mission, steps, status: newStatus } as unknown as Mission;
}

export async function acceptMission(userId: string, missionId: string): Promise<Mission> {
  const { data: mission, error } = await supabase
    .from('missions')
    .select('*')
    .eq('id', missionId)
    .eq('status', 'pending')
    .single();

  if (error || !mission) throw new Error('Misión no encontrada o ya aceptada');
  if (!(mission.target_users as string[]).includes(userId)) {
    throw new Error('No tenés acceso a esta misión');
  }

  const { error: updateError } = await supabase
    .from('missions')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', missionId);

  if (updateError) throw updateError;

  return { ...mission, status: 'active' } as unknown as Mission;
}

export async function abandonMission(userId: string, missionId: string): Promise<void> {
  const { data: mission } = await supabase
    .from('missions')
    .select('penalty, target_users')
    .eq('id', missionId)
    .single();

  if (!mission) throw new Error('Misión no encontrada');
  if (!(mission.target_users as string[]).includes(userId)) {
    throw new Error('No tenés acceso a esta misión');
  }

  const penalty = mission.penalty as any;
  if (penalty?.money > 0) {
    await applyTransaction(userId, -penalty.money, 'penalty', 'Penalidad por abandono de misión');
  }

  await supabase
    .from('missions')
    .update({ status: 'failed', updated_at: new Date().toISOString() })
    .eq('id', missionId);
}

export async function expireOldMissions(): Promise<void> {
  const { error } = await supabase
    .from('missions')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .in('status', ['pending', 'active'])
    .lt('expires_at', new Date().toISOString());

  if (error) {
    logger.error('Error expiring missions', { error: error.message });
  }
}
