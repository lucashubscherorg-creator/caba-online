import { supabase } from '../../config/supabase';
import { logger } from '../../config/logger';
import { DOLLAR_BASE_RATE } from '../../../../shared/constants';
import type { WorldEvent } from '../../../../shared/types';

// Estado económico global en memoria (se actualiza con eventos)
let economyState = {
  dollarRate: DOLLAR_BASE_RATE,
  inflationIndex: 100,   // base 100
  priceMultiplier: 1.0,
  safetyMultiplier: 1.0,
  lastUpdated: new Date().toISOString(),
};

export function getEconomyState() {
  return { ...economyState };
}

export function applyWorldEventImpact(event: WorldEvent) {
  const { economicImpact, safetyImpact } = event;

  // Aplicar impacto económico
  if (Math.abs(economicImpact) > 0) {
    const delta = economicImpact / 100;
    economyState.inflationIndex = Math.max(50, Math.min(300, economyState.inflationIndex - delta * 20));
    economyState.priceMultiplier = Math.max(0.5, Math.min(3.0, economyState.priceMultiplier * (1 - delta * 0.1)));

    if (event.type === 'dolar_salto' || event.type === 'crisis_economica') {
      const jump = Math.abs(economicImpact) / 100;
      economyState.dollarRate = Math.round(economyState.dollarRate * (1 + jump * 0.15));
    }
  }

  if (Math.abs(safetyImpact) > 0) {
    const delta = safetyImpact / 100;
    economyState.safetyMultiplier = Math.max(0.3, Math.min(2.0, economyState.safetyMultiplier * (1 + delta * 0.1)));
  }

  economyState.lastUpdated = new Date().toISOString();
  logger.info('Economy updated by world event', { eventType: event.type, newState: economyState });
}

export async function applyTransaction(
  userId: string,
  amount: number,
  type: 'income' | 'expense' | 'penalty' | 'reward',
  description: string
): Promise<{ newBalance: number }> {
  // Obtener balance actual
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single();

  if (fetchError || !user) throw new Error('Usuario no encontrado');

  const newBalance = Math.max(0, (user.balance as number) + amount);

  const { error: updateError } = await supabase
    .from('users')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (updateError) throw updateError;

  // Registrar transacción
  await supabase.from('transactions').insert({
    user_id: userId,
    amount,
    type,
    description,
    created_at: new Date().toISOString(),
  });

  return { newBalance };
}

export async function calculateRoleIncome(roleId: string): Promise<number> {
  const { priceMultiplier, inflationIndex } = economyState;
  // Ingresos ajustados por inflación y multiplicador de precios
  const baseMultiplier = (inflationIndex / 100) * priceMultiplier;
  return baseMultiplier;
}

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, balance, level, role_id')
    .order('balance', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}

export async function getTransactionHistory(userId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data ?? [];
}

// Decay suave del estado económico hacia la normalidad (cada hora)
export function applyEconomicDecay() {
  const decayRate = 0.02;
  economyState.inflationIndex = economyState.inflationIndex + (100 - economyState.inflationIndex) * decayRate;
  economyState.priceMultiplier = economyState.priceMultiplier + (1 - economyState.priceMultiplier) * decayRate;
  economyState.safetyMultiplier = economyState.safetyMultiplier + (1 - economyState.safetyMultiplier) * decayRate;
  economyState.lastUpdated = new Date().toISOString();
}
