// ============================================
// UI STORE — CABA ONLINE
// ============================================

import { create } from 'zustand';
import type { Mission } from '@shared/types';

export type NotificationType = 'info' | 'success' | 'warning' | 'danger';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // ms, default 5000
}

export type ModalType =
  | 'role-select'
  | 'mission-detail'
  | 'npc-interact'
  | 'neighborhood-info'
  | 'confirm-action'
  | null;

interface PanelState {
  playerPanel: boolean;
  eventsPanel: boolean;
  chatPanel: boolean;
  missionsPanel: boolean;
}

interface UiState {
  panels: PanelState;
  activeModal: ModalType;
  modalData: unknown;
  notifications: Notification[];
  selectedMission: Mission | null;
  selectedNeighborhoodId: string | null;
  isMobileMenuOpen: boolean;
  isMapExpanded: boolean;

  // Panel actions
  togglePanel: (panel: keyof PanelState) => void;
  openPanel: (panel: keyof PanelState) => void;
  closePanel: (panel: keyof PanelState) => void;

  // Modal actions
  openModal: (type: ModalType, data?: unknown) => void;
  closeModal: () => void;

  // Notification actions
  notify: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;

  // Selection actions
  selectMission: (mission: Mission | null) => void;
  selectNeighborhood: (id: string | null) => void;

  // Layout actions
  toggleMobileMenu: () => void;
  toggleMapExpanded: () => void;
}

let notificationCounter = 0;

export const useUiStore = create<UiState>((set, get) => ({
  panels: {
    playerPanel: true,
    eventsPanel: true,
    chatPanel: false,
    missionsPanel: true,
  },
  activeModal: null,
  modalData: null,
  notifications: [],
  selectedMission: null,
  selectedNeighborhoodId: null,
  isMobileMenuOpen: false,
  isMapExpanded: false,

  togglePanel: (panel) =>
    set((s) => ({
      panels: { ...s.panels, [panel]: !s.panels[panel] },
    })),

  openPanel: (panel) =>
    set((s) => ({
      panels: { ...s.panels, [panel]: true },
    })),

  closePanel: (panel) =>
    set((s) => ({
      panels: { ...s.panels, [panel]: false },
    })),

  openModal: (type, data = null) =>
    set({ activeModal: type, modalData: data }),

  closeModal: () =>
    set({ activeModal: null, modalData: null }),

  notify: (notification) => {
    const id = `notif-${++notificationCounter}-${Date.now()}`;
    const full: Notification = { id, duration: 5000, ...notification };

    set((s) => ({
      notifications: [...s.notifications, full],
    }));

    // Auto-dismiss
    const duration = full.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().dismissNotification(id);
      }, duration);
    }
  },

  dismissNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),

  selectMission: (mission) => set({ selectedMission: mission }),

  selectNeighborhood: (id) => set({ selectedNeighborhoodId: id }),

  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),

  toggleMapExpanded: () =>
    set((s) => ({ isMapExpanded: !s.isMapExpanded })),
}));
