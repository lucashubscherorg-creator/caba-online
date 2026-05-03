// ============================================
// ECONOMY BAR — CABA ONLINE
// ============================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, Activity, Clock } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayed, setDisplayed] = useState(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (value !== displayed) {
      setFlash(true);
      setDisplayed(value);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={displayed}
        initial={flash ? { opacity: 0, y: -6 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={flash ? 'text-gold-400' : ''}
      >
        {prefix}{displayed.toLocaleString('es-AR')}{suffix}
      </motion.span>
    </AnimatePresence>
  );
}

function ServerClock() {
  const { worldState } = useGameStore();
  const [time, setTime] = useState(() => new Date(worldState.serverTime));

  useEffect(() => {
    setTime(new Date(worldState.serverTime));
  }, [worldState.serverTime]);

  useEffect(() => {
    const tick = setInterval(() => setTime((t) => new Date(t.getTime() + 1000)), 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <span>
      {time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

export default function EconomyBar() {
  const { worldState } = useGameStore();

  return (
    <div className="h-10 glass-dark border-b border-white/5 flex items-center px-4 gap-6 shrink-0">
      {/* Dollar rate */}
      <div className="flex items-center gap-1.5 text-xs text-white/70">
        <DollarSign className="w-3.5 h-3.5 text-gold-400" />
        <span className="text-white/40">USD blue</span>
        <span className="font-semibold text-gold-400">
          $<AnimatedNumber value={worldState.dollarRate} />
        </span>
      </div>

      <div className="h-4 w-px bg-white/10" />

      {/* Inflation */}
      <div className="flex items-center gap-1.5 text-xs text-white/70">
        <TrendingUp className="w-3.5 h-3.5 text-red-400" />
        <span className="text-white/40">Inflación mensual</span>
        <span className="font-semibold text-red-400">
          <AnimatedNumber value={worldState.inflationIndex} suffix="%" />
        </span>
      </div>

      <div className="h-4 w-px bg-white/10" />

      {/* Activity index */}
      <div className="flex items-center gap-1.5 text-xs text-white/70">
        <Activity className="w-3.5 h-3.5 text-brand-400" />
        <span className="text-white/40">Actividad</span>
        <div className="flex items-center gap-1.5">
          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-400 rounded-full"
              animate={{ width: `${worldState.activityIndex}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="font-semibold text-brand-300">
            <AnimatedNumber value={worldState.activityIndex} suffix="%" />
          </span>
        </div>
      </div>

      <div className="h-4 w-px bg-white/10" />

      {/* Server time */}
      <div className="flex items-center gap-1.5 text-xs text-white/70 ml-auto">
        <Clock className="w-3.5 h-3.5 text-white/40" />
        <span className="text-white/40">Hora ciudad</span>
        <span className="font-mono font-semibold text-white/70">
          <ServerClock />
        </span>
      </div>
    </div>
  );
}
