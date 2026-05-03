// ============================================
// MISSION CARD — CABA ONLINE
// ============================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, Banknote, CheckCircle, XCircle, PlayCircle, Flag } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useUiStore } from '../../store/uiStore';
import { api } from '../../services/api';
import type { Mission, MissionType } from '@shared/types';

const TYPE_LABELS: Record<MissionType, string> = {
  personal:    'Personal',
  cooperative: 'Cooperativa',
  competitive: 'Competitiva',
  crisis:      'Crisis',
  news_event:  'Noticia Real',
};

const TYPE_COLORS: Record<MissionType, string> = {
  personal:    'bg-brand-500/20 text-brand-300 border-brand-500/30',
  cooperative: 'bg-green-500/20 text-green-400 border-green-500/30',
  competitive: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  crisis:      'bg-red-500/20 text-red-400 border-red-500/30',
  news_event:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(() => {
    return Math.max(0, new Date(expiresAt).getTime() - Date.now());
  });

  useEffect(() => {
    const tick = setInterval(() => {
      const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(ms);
    }, 1000);
    return () => clearInterval(tick);
  }, [expiresAt]);

  const totalSecs = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const isUrgent = remaining < 5 * 60 * 1000; // < 5 min

  return (
    <span className={`font-mono text-xs ${isUrgent ? 'text-red-400 animate-pulse' : 'text-white/60'}`}>
      {hours > 0 ? `${hours}h ` : ''}{String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}

function DifficultyStars({ difficulty }: { difficulty: number }) {
  const filled = Math.round((difficulty / 10) * 5);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < filled ? 'text-gold-400 fill-gold-400' : 'text-white/20'}`}
        />
      ))}
    </div>
  );
}

interface Props {
  mission: Mission;
  compact?: boolean;
}

export default function MissionCard({ mission, compact = false }: Props) {
  const { updateMission, removeMission } = useGameStore();
  const { notify } = useUiStore();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    const res = await api.post(`/missions/${mission.id}/accept`, {});
    if (res.success) {
      updateMission(mission.id, { status: 'active' });
      notify({ type: 'success', title: 'Misión aceptada', message: mission.title });
    } else {
      notify({ type: 'danger', title: 'Error', message: res.error ?? 'No se pudo aceptar la misión' });
    }
    setLoading(false);
  };

  const handleAbandon = async () => {
    setLoading(true);
    const res = await api.post(`/missions/${mission.id}/abandon`, {});
    if (res.success) {
      removeMission(mission.id);
      notify({ type: 'warning', title: 'Misión abandonada', message: mission.title });
    } else {
      notify({ type: 'danger', title: 'Error', message: res.error ?? 'No se pudo abandonar' });
    }
    setLoading(false);
  };

  const handleCompleteStep = async () => {
    const nextStep = mission.steps.find((s) => !s.completed);
    if (!nextStep) return;
    setLoading(true);
    const res = await api.post(`/missions/${mission.id}/steps/${nextStep.id}/complete`, {});
    if (res.success) {
      const updatedSteps = mission.steps.map((s) =>
        s.id === nextStep.id ? { ...s, completed: true } : s
      );
      const allDone = updatedSteps.every((s) => s.completed);
      if (allDone) {
        updateMission(mission.id, { steps: updatedSteps, status: 'completed' });
        notify({ type: 'success', title: '¡Misión completada!', message: `+$${mission.reward.money.toLocaleString('es-AR')} y +${mission.reward.reputation} rep.` });
      } else {
        updateMission(mission.id, { steps: updatedSteps });
        notify({ type: 'info', title: 'Paso completado', message: nextStep.description });
      }
    } else {
      notify({ type: 'danger', title: 'Error', message: res.error ?? 'No se pudo completar el paso' });
    }
    setLoading(false);
  };

  const completedSteps = mission.steps.filter((s) => s.completed).length;
  const totalSteps = mission.steps.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="card space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`badge border ${TYPE_COLORS[mission.type]}`}>
              {TYPE_LABELS[mission.type]}
            </span>
            {mission.type === 'news_event' && (
              <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                NOTICIA REAL
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white leading-tight">{mission.title}</h3>
        </div>
        <Flag className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
      </div>

      {!compact && (
        <p className="text-xs text-white/60 leading-relaxed">{mission.description}</p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1 text-gold-400">
          <Banknote className="w-3.5 h-3.5" />
          <span className="font-semibold">${mission.reward.money.toLocaleString('es-AR')}</span>
        </div>
        <div className="flex items-center gap-1 text-white/50">
          <Clock className="w-3.5 h-3.5" />
          <Countdown expiresAt={mission.expiresAt} />
        </div>
        <DifficultyStars difficulty={mission.difficulty} />
      </div>

      {/* Step progress */}
      {totalSteps > 0 && (
        <div>
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Progreso</span>
            <span>{completedSteps}/{totalSteps}</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-400 rounded-full"
              animate={{ width: `${(completedSteps / Math.max(totalSteps, 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {mission.status === 'pending' && (
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Aceptar
          </button>
        )}
        {mission.status === 'active' && (
          <>
            <button
              onClick={handleCompleteStep}
              disabled={loading || completedSteps === totalSteps}
              className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Completar paso
            </button>
            <button
              onClick={handleAbandon}
              disabled={loading}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 text-red-400 hover:text-red-300 border-red-500/20"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
