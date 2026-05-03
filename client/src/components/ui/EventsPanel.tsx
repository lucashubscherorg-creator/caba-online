// ============================================
// EVENTS PANEL — CABA ONLINE
// ============================================

import { AnimatePresence, motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Radio, MessageSquare } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useUiStore } from '../../store/uiStore';
import MissionCard from './MissionCard';
import type { WorldEvent } from '@shared/types';

function ImpactIcon({ impact }: { impact: number }) {
  if (impact > 0) return <TrendingUp className="w-3.5 h-3.5 text-green-400" />;
  if (impact < 0) return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-white/40" />;
}

function EventRow({ event, index }: { event: WorldEvent; index: number }) {
  const impactColor =
    event.economicImpact > 0 ? 'text-green-400' :
    event.economicImpact < 0 ? 'text-red-400' :
    'text-white/40';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="glass rounded-lg p-3 space-y-1.5"
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <span className="text-xl leading-none mt-0.5" role="img" aria-label={event.type}>
          {event.iconEmoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-white leading-tight">{event.title}</p>
            {event.type === 'noticia_real' && (
              <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                <Radio className="w-2.5 h-2.5" />
                NOTICIA REAL
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 leading-relaxed mt-0.5 line-clamp-2">
            {event.description}
          </p>
        </div>
      </div>

      {/* Impact */}
      <div className="flex items-center gap-3 text-xs">
        <div className={`flex items-center gap-1 ${impactColor}`}>
          <ImpactIcon impact={event.economicImpact} />
          <span className="font-semibold">
            {event.economicImpact > 0 ? '+' : ''}{event.economicImpact}% economía
          </span>
        </div>
        {event.affectedNeighborhoods.length > 0 && (
          <span className="text-white/30">
            {event.affectedNeighborhoods.length} barrio{event.affectedNeighborhoods.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function EventsPanel() {
  const { activeEvents, myMissions } = useGameStore();
  const { togglePanel } = useUiStore();

  const activeMissions = myMissions.filter((m) => m.status === 'active' || m.status === 'pending');

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      {/* Events section */}
      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wide">
            Eventos activos
            {activeEvents.length > 0 && (
              <span className="ml-2 bg-brand-500/30 text-brand-300 rounded-full px-2 py-0.5 text-[10px]">
                {activeEvents.length}
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <AnimatePresence>
            {activeEvents.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/30 text-xs text-center py-6"
              >
                No hay eventos activos en la ciudad.
              </motion.p>
            ) : (
              activeEvents.map((event: WorldEvent, i) => (
                <EventRow key={event.id} event={event} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Missions section */}
      <div className="flex flex-col gap-2 max-h-[40%] overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wide">
            Mis misiones
            {activeMissions.length > 0 && (
              <span className="ml-2 bg-gold-500/20 text-gold-400 rounded-full px-2 py-0.5 text-[10px]">
                {activeMissions.length}
              </span>
            )}
          </h2>
          <button
            onClick={() => togglePanel('chatPanel')}
            className="text-white/30 hover:text-white/60 transition-colors"
            aria-label="Chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-2 pr-1">
          <AnimatePresence>
            {activeMissions.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/30 text-xs text-center py-4"
              >
                No tenés misiones activas.
              </motion.p>
            ) : (
              activeMissions.slice(0, 3).map((mission) => (
                <MissionCard key={mission.id} mission={mission} compact />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
