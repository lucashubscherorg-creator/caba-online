// ============================================
// useGameState HOOK — CABA ONLINE
// ============================================

import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { api } from '../services/api';
import type { WorldEvent, Mission, NPC, User } from '@shared/types';

const POLL_INTERVAL_MS = 30_000; // 30s

interface WorldStateResponse {
  dollarRate: number;
  inflationIndex: number;
  activityIndex: number;
  serverTime: string;
}

/**
 * Combines gameStore with polling of the world state.
 * Call once at the GamePage level.
 */
export function useGameState() {
  const { user } = useAuthStore();
  const {
    worldState,
    activeEvents,
    players,
    npcs,
    myMissions,
    isWorldLoaded,
    setWorldState,
    setActiveEvents,
    setPlayers,
    setNpcs,
    setMyMissions,
    setWorldLoaded,
    setupSocketListeners,
  } = useGameStore();

  const { notify } = useUiStore();

  const fetchWorldData = useCallback(async () => {
    if (!user) return;

    try {
      const [eventsRes, missionsRes, npcsRes, playersRes, worldRes] =
        await Promise.allSettled([
          api.get<WorldEvent[]>('/events/active'),
          api.get<Mission[]>('/missions/active'),
          api.get<NPC[]>('/npcs'),
          api.get<User[]>('/players/online'),
          api.get<WorldStateResponse>('/economy/state'),
        ]);

      if (eventsRes.status === 'fulfilled' && eventsRes.value.success && eventsRes.value.data) {
        setActiveEvents(eventsRes.value.data);
      }

      if (missionsRes.status === 'fulfilled' && missionsRes.value.success && missionsRes.value.data) {
        setMyMissions(missionsRes.value.data);
      }

      if (npcsRes.status === 'fulfilled' && npcsRes.value.success && npcsRes.value.data) {
        setNpcs(npcsRes.value.data);
      }

      if (playersRes.status === 'fulfilled' && playersRes.value.success && playersRes.value.data) {
        setPlayers(playersRes.value.data);
      }

      if (worldRes.status === 'fulfilled' && worldRes.value.success && worldRes.value.data) {
        setWorldState(worldRes.value.data);
      }

      if (!isWorldLoaded) {
        setWorldLoaded(true);
      }
    } catch (err) {
      console.error('[GameState] Error fetching world data:', err);
      notify({
        type: 'danger',
        title: 'Error de conexión',
        message: 'No se pudo cargar el estado del mundo.',
      });
    }
  }, [user, isWorldLoaded, setActiveEvents, setMyMissions, setNpcs, setPlayers, setWorldState, setWorldLoaded, notify]);

  // Initial fetch + socket listeners
  useEffect(() => {
    if (!user) return;

    fetchWorldData();
    const cleanupSockets = setupSocketListeners();

    // Polling fallback
    const intervalId = setInterval(fetchWorldData, POLL_INTERVAL_MS);

    return () => {
      cleanupSockets();
      clearInterval(intervalId);
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    worldState,
    activeEvents,
    players,
    npcs,
    myMissions,
    isWorldLoaded,
    refresh: fetchWorldData,
  };
}
