// ============================================
// LOADING SCREEN — CABA ONLINE
// ============================================

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-brand-950 flex flex-col items-center justify-center z-50">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-700/10 blur-3xl" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 relative z-10"
      >
        {/* Icon with pulse */}
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl bg-brand-600/30 border border-brand-400/30 flex items-center justify-center shadow-glow"
          >
            <MapPin className="w-10 h-10 text-brand-400" />
          </motion.div>
          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-2xl border border-brand-400/40"
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">CABA Online</h1>
          <p className="text-white/50 mt-1 text-sm">Viví la ciudad. Sobreviví al caos.</p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-brand-400 to-transparent rounded-full"
          />
        </div>

        <p className="text-white/40 text-xs tracking-widest uppercase">
          Cargando la ciudad...
        </p>
      </motion.div>
    </div>
  );
}
