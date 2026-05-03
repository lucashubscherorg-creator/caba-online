// ============================================
// GAME PAGE — CABA ONLINE
// ============================================

import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Map, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useGameState } from '../hooks/useGameState';
import EconomyBar from '../components/ui/EconomyBar';
import PlayerPanel from '../components/ui/PlayerPanel';
import EventsPanel from '../components/ui/EventsPanel';
import NotificationContainer from '../components/ui/Notification';
import LoadingScreen from '../components/ui/LoadingScreen';

// Lazy-load map to avoid SSR issues and speed up initial render
const GameMap = lazy(() => import('../components/map/GameMap'));

function CollapseButton({
  side,
  collapsed,
  onToggle,
}: {
  side: 'left' | 'right';
  collapsed: boolean;
  onToggle: () => void;
}) {
  const Icon = side === 'left'
    ? (collapsed ? ChevronRight : ChevronLeft)
    : (collapsed ? ChevronLeft : ChevronRight);

  return (
    <button
      onClick={onToggle}
      className="absolute top-1/2 -translate-y-1/2 z-10 w-5 h-10 flex items-center justify-center
                 bg-brand-900/80 border border-white/10 hover:bg-brand-800/80 text-white/40
                 hover:text-white/80 transition-all rounded-sm backdrop-blur-sm"
      style={side === 'left' ? { right: -10 } : { left: -10 }}
      aria-label={collapsed ? 'Expandir panel' : 'Colapsar panel'}
    >
      <Icon className="w-3 h-3" />
    </button>
  );
}

export default function GamePage() {
  const { user, logout } = useAuthStore();
  const { panels, togglePanel } = useUiStore();
  const { isWorldLoaded } = useGameState();

  if (!isWorldLoaded) {
    return <LoadingScreen />;
  }

  const leftCollapsed = !panels.playerPanel;
  const rightCollapsed = !panels.eventsPanel;

  return (
    <div className="h-screen flex flex-col bg-brand-950 overflow-hidden">
      {/* Economy top bar */}
      <EconomyBar />

      {/* Main game area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left panel — Player info */}
        <motion.aside
          animate={{ width: leftCollapsed ? 0 : 280 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="relative shrink-0 overflow-hidden glass-dark border-r border-white/5"
        >
          <CollapseButton
            side="left"
            collapsed={leftCollapsed}
            onToggle={() => togglePanel('playerPanel')}
          />
          <div
            className="h-full p-3 overflow-hidden"
            style={{ width: 280, opacity: leftCollapsed ? 0 : 1, transition: 'opacity 0.15s' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Mi personaje
              </h2>
              <button
                onClick={logout}
                className="text-white/30 hover:text-white/60 transition-colors flex items-center gap-1 text-xs"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
            <PlayerPanel />
          </div>
        </motion.aside>

        {/* Center — Map */}
        <main className="flex-1 relative overflow-hidden">
          {/* Map expand toggle when both panels collapsed */}
          {(leftCollapsed || rightCollapsed) && (
            <div className="absolute top-3 left-3 z-[500] flex gap-1">
              {leftCollapsed && (
                <button
                  onClick={() => togglePanel('playerPanel')}
                  className="glass rounded-lg px-2.5 py-1.5 text-xs text-white/60 hover:text-white
                             flex items-center gap-1.5 transition-all"
                >
                  <Map className="w-3.5 h-3.5" />
                  Personaje
                </button>
              )}
            </div>
          )}

          <Suspense
            fallback={
              <div className="w-full h-full bg-brand-950 flex items-center justify-center">
                <div className="text-white/40 text-sm">Cargando mapa...</div>
              </div>
            }
          >
            <GameMap />
          </Suspense>

          {/* Username watermark bottom-left */}
          {user && (
            <div className="absolute bottom-3 left-3 z-[500] pointer-events-none">
              <span className="text-white/20 text-xs font-mono">{user.username}</span>
            </div>
          )}
        </main>

        {/* Right panel — Events + Missions */}
        <motion.aside
          animate={{ width: rightCollapsed ? 0 : 300 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="relative shrink-0 overflow-hidden glass-dark border-l border-white/5"
        >
          <CollapseButton
            side="right"
            collapsed={rightCollapsed}
            onToggle={() => togglePanel('eventsPanel')}
          />
          <div
            className="h-full p-3 overflow-hidden"
            style={{ width: 300, opacity: rightCollapsed ? 0 : 1, transition: 'opacity 0.15s' }}
          >
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              Ciudad en tiempo real
            </h2>
            <EventsPanel />
          </div>
        </motion.aside>
      </div>

      {/* Global notification system */}
      <NotificationContainer />
    </div>
  );
}
