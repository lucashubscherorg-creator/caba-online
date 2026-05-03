// ============================================
// PLAYER PANEL — CABA ONLINE
// ============================================

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote, Star, Zap, Shield, Users, Wrench, Dumbbell,
  Brain, RefreshCw, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { GAME_CONFIG } from '@shared/constants';
import type { UserSkills } from '@shared/types';

const SKILL_ICONS: Record<keyof UserSkills, React.ReactNode> = {
  street:       <Shield className="w-3 h-3" />,
  social:       <Users className="w-3 h-3" />,
  technical:    <Wrench className="w-3 h-3" />,
  physical:     <Dumbbell className="w-3 h-3" />,
  intelligence: <Brain className="w-3 h-3" />,
};

const SKILL_LABELS: Record<keyof UserSkills, string> = {
  street:       'Calle',
  social:       'Social',
  technical:    'Técnica',
  physical:     'Física',
  intelligence: 'Inteligencia',
};

function SkillBar({ label, icon, value }: { label: string; icon: React.ReactNode; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/40 shrink-0">{icon}</span>
      <span className="text-white/60 text-xs w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className="text-white/40 text-xs w-6 text-right">{value}</span>
    </div>
  );
}

function AnimatedBalance({ value }: { value: number }) {
  const prevRef = useRef(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (value !== prevRef.current) {
      setFlash(value > prevRef.current ? 'up' : 'down');
      prevRef.current = value;
      const t = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: flash === 'up' ? 6 : -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={
          flash === 'up' ? 'text-green-400' :
          flash === 'down' ? 'text-red-400' :
          'text-white'
        }
      >
        ${value.toLocaleString('es-AR')}
      </motion.span>
    </AnimatePresence>
  );
}

const ILLEGAL_ROLES = new Set([
  'mechero', 'bichicome', 'cuentero_tio', 'ruletero', 'mula',
  'colado_profesional', 'dealer_trucho', 'buchon', 'espia_industrial',
  'funcionario_corrupto',
]);

const GRAY_ROLES = new Set([
  'vendedor_ambulante', 'changarin', 'cartonero', 'cuidacoches', 'feriante',
  'delivery', 'malabarista', 'musico_callejero', 'artesano', 'ninero',
  'costurera', 'peluquero_domicilio', 'prestamista', 'puntero', 'sin_trabajo',
]);

function deriveLegalStatus(roleId: string): 'legal' | 'gray' | 'illegal' {
  if (ILLEGAL_ROLES.has(roleId)) return 'illegal';
  if (GRAY_ROLES.has(roleId)) return 'gray';
  return 'legal';
}

function LegalityBadge({ status }: { status: 'legal' | 'gray' | 'illegal' }) {
  if (status === 'legal') return <span className="badge-legal">Legal</span>;
  if (status === 'gray') return <span className="badge-gray">Informal</span>;
  return <span className="badge-illegal">Ilegal</span>;
}

export default function PlayerPanel() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const xpForLevel = GAME_CONFIG.xpPerLevel;
  // Mock XP within level — replace with real value when available
  const currentXp = (user.level % 1) * xpForLevel || 0;
  const xpPercent = Math.min((currentXp / xpForLevel) * 100, 100);
  const reputationPercent = Math.min(user.reputation, 100);

  const legalStatus = deriveLegalStatus(user.roleId);

  const skills = user.skills ?? {
    street: 0, social: 0, technical: 0, physical: 0, intelligence: 0,
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 scrollbar-thin">
      {/* Avatar + name */}
      <div className="card flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-brand-600/40 border-2 border-brand-400/50 flex items-center justify-center text-lg font-bold text-brand-300 shadow-glow">
            {user.username[0].toUpperCase()}
          </div>
          {user.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-brand-950" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{user.username}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-white/50 text-xs">Nivel {user.level}</span>
            <LegalityBadge status={legalStatus} />
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <Banknote className="w-4 h-4 text-gold-400" />
          <span className="text-white/50 text-xs uppercase tracking-wide">Balance</span>
        </div>
        <p className="text-2xl font-bold font-mono">
          <AnimatedBalance value={user.balance} />
        </p>
      </div>

      {/* Reputation + XP */}
      <div className="card space-y-3">
        {/* Reputation */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-white/60 text-xs">Reputación</span>
            </div>
            <span className="text-gold-400 text-xs font-semibold">{user.reputation}/100</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400"
              animate={{ width: `${reputationPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* XP */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-white/60 text-xs">Nivel {user.level}</span>
            </div>
            <span className="text-brand-300 text-xs font-semibold">
              {currentXp}/{xpForLevel} XP
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card space-y-2">
        <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Habilidades</p>
        {(Object.keys(SKILL_LABELS) as Array<keyof UserSkills>).map((key) => (
          <SkillBar
            key={key}
            label={SKILL_LABELS[key]}
            icon={SKILL_ICONS[key]}
            value={skills[key] ?? 0}
          />
        ))}
      </div>

      {/* Change role button */}
      <button
        onClick={() => navigate('/rol')}
        className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
      >
        <RefreshCw className="w-4 h-4" />
        Cambiar Rol
        <ChevronRight className="w-4 h-4 ml-auto" />
      </button>
    </div>
  );
}
