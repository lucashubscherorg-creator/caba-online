// ============================================
// GAME STORE — CABA ONLINE
// ============================================

import { create } from 'zustand';
import { onSocketEvent } from '../services/socket';
import type { User, WorldEvent, Mission, NPC } from '@shared/types';

interface WorldState {
  dollarRate: number;
  inflationIndex: number;
  activityIndex: number;
  serverTime: string;
}

interface GameState {
  worldState: WorldState;
  activeEvents: WorldEvent[];
  players: User[];
  npcs: NPC[];
  myMissions: Mission[];
  isWorldLoaded: boolean;

  // Actions
  setWorldState: (state: Partial<WorldState>) => void;
  setActiveEvents: (events: WorldEvent[]) => void;
  addEvent: (event: WorldEvent) => void;
  removeEvent: (eventId: string) => void;
  updateEvent: (eventId: string, patch: Partial<WorldEvent>) => void;
  setPlayers: (players: User[]) => void;
  addPlayer: (player: User) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerPosition: (playerId: string, lat: number, lng: number) => void;
  setNpcs: (npcs: NPC[]) => void;
  updateNpcPosition: (npcId: string, lat: number, lng: number) => void;
  setMyMissions: (missions: Mission[]) => void;
  addMission: (mission: Mission) => void;
  updateMission: (missionId: string, patch: Partial<Mission>) => void;
  removeMission: (missionId: string) => void;
  setWorldLoaded: (loaded: boolean) => void;
  setupSocketListeners: () => () => void;
}

const DEFAULT_WORLD: WorldState = {
  dollarRate: 1200,
  inflationIndex: 3.2,
  activityIndex: 74,
  serverTime: new Date().toISOString(),
};

export const useGameStore = create<GameState>((set, get) => ({
  worldState: DEFAULT_WORLD,
  activeEvents: [],
  players: [],
  npcs: [],
  myMissions: [],
  isWorldLoaded: false,

  setWorldState: (patch) =>
    set((s) => ({ worldState: { ...s.worldState, ...patch } })),

  setActiveEvents: (events) => set({ activeEvents: events }),

  addEvent: (event) =>
    set((s) => ({
      activeEvents: [event, ...s.activeEvents.filter((e) => e.id !== event.id)],
    })),

  removeEvent: (eventId) =>
    set((s) => ({ activeEvents: s.activeEvents.filter((e) => e.id !== eventId) })),

  updateEvent: (eventId, patch) =>
    set((s) => ({
      activeEvents: s.activeEvents.map((e) =>
        e.id === eventId ? { ...e, ...patch } : e
      ),
    })),

  setPlayers: (players) => set({ players }),

  addPlayer: (player) =>
    set((s) => ({
      players: [player, ...s.players.filter((p) => p.id !== player.id)],
    })),

  removePlayer: (playerId) =>
    set((s) => ({ players: s.players.filter((p) => p.id !== playerId) })),

  updatePlayerPosition: (playerId, lat, lng) =>
    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, position: { lat, lng } } : p
      ),
    })),

  setNpcs: (npcs) => set({ npcs }),

  updateNpcPosition: (npcId, lat, lng) =>
    set((s) => ({
      npcs: s.npcs.map((n) =>
        n.id === npcId ? { ...n, position: { lat, lng } } : n
      ),
    })),

  setMyMissions: (missions) => set({ myMissions: missions }),

  addMission: (mission) =>
    set((s) => ({
      myMissions: [mission, ...s.myMissions.filter((m) => m.id !== mission.id)],
    })),

  updateMission: (missionId, patch) =>
    set((s) => ({
      myMissions: s.myMissions.map((m) =>
        m.id === missionId ? { ...m, ...patch } : m
      ),
    })),

  removeMission: (missionId) =>
    set((s) => ({ myMissions: s.myMissions.filter((m) => m.id !== missionId) })),

  setWorldLoaded: (loaded) => set({ isWorldLoaded: loaded }),

  setupSocketListeners: () => {
    const unsubs: Array<() => void> = [];

    unsubs.push(
      onSocketEvent<User>('user:join', (player) => {
        get().addPlayer(player);
      })
    );

    unsubs.push(
      onSocketEvent<{ userId: string }>('user:leave', ({ userId }) => {
        get().removePlayer(userId);
      })
    );

    unsubs.push(
      onSocketEvent<{ userId: string; lat: number; lng: number }>('user:move', ({ userId, lat, lng }) => {
        get().updatePlayerPosition(userId, lat, lng);
      })
    );

    unsubs.push(
      onSocketEvent<WorldEvent>('world:event', (event) => {
        get().addEvent(event);
      })
    );

    unsubs.push(
      onSocketEvent<Mission>('mission:new', (mission) => {
        get().addMission(mission);
      })
    );

    unsubs.push(
      onSocketEvent<{ missionId: string; patch: Partial<Mission> }>('mission:update', ({ missionId, patch }) => {
        get().updateMission(missionId, patch);
      })
    );

    unsubs.push(
      onSocketEvent<Partial<WorldState>>('economy:update', (update) => {
        get().setWorldState(update);
      })
    );

    unsubs.push(
      onSocketEvent<{ npcId: string; lat: number; lng: number }>('npc:move', ({ npcId, lat, lng }) => {
        get().updateNpcPosition(npcId, lat, lng);
      })
    );

    // Return cleanup
    return () => unsubs.forEach((fn) => fn());
  },
}));
