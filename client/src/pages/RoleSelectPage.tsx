// ============================================
// ROLE SELECT PAGE — CABA ONLINE
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Briefcase, AlertTriangle, Shield, Mic, Star,
  Filter, ArrowRight, CheckCircle, Loader2, TrendingUp, Zap
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import type { Role, RoleCategory } from '@shared/types';

const CATEGORY_META: Record<RoleCategory, { label: string; icon: React.ReactNode; color: string }> = {
  formal:    { label: 'Trabajo Formal', icon: <Briefcase className="w-4 h-4" />, color: 'text-brand-400' },
  informal:  { label: 'Economía Informal', icon: <TrendingUp className="w-4 h-4" />, color: 'text-yellow-400' },
  illegal:   { label: 'Mercado Negro', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-400' },
  service:   { label: 'Servicios', icon: <Shield className="w-4 h-4" />, color: 'text-green-400' },
  political: { label: 'Política', icon: <Star className="w-4 h-4" />, color: 'text-purple-400' },
  media:     { label: 'Medios', icon: <Mic className="w-4 h-4" />, color: 'text-pink-400' },
  special:   { label: 'Especiales', icon: <Zap className="w-4 h-4" />, color: 'text-gold-400' },
};

const LEGAL_BADGE: Record<string, string> = {
  legal:   'badge-legal',
  gray:    'badge-gray',
  illegal: 'badge-illegal',
};

const LEGAL_LABEL: Record<string, string> = {
  legal:   'Legal',
  gray:    'Informal',
  illegal: 'Ilegal',
};

function RiskBar({ level }: { level: number }) {
  const color =
    level <= 3 ? 'bg-green-400' :
    level <= 6 ? 'bg-yellow-400' :
    'bg-red-400';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-white/40">
        <span>Riesgo</span>
        <span>{level}/10</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${level * 10}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function RoleCard({
  role,
  selected,
  onSelect,
  userLevel,
}: {
  role: Role;
  selected: boolean;
  onSelect: (role: Role) => void;
  userLevel: number;
}) {
  const cat = CATEGORY_META[role.category];
  const isLocked = role.unlockLevel > userLevel;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!isLocked ? { scale: 1.02 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      onClick={() => !isLocked && onSelect(role)}
      disabled={isLocked}
      className={`
        relative text-left rounded-xl border p-4 transition-all duration-200 space-y-3
        ${selected
          ? 'bg-brand-600/20 border-brand-400/60 shadow-glow'
          : isLocked
            ? 'bg-white/3 border-white/5 opacity-50 cursor-not-allowed'
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer'
        }
      `}
    >
      {/* Selected check */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3"
        >
          <CheckCircle className="w-5 h-5 text-brand-400" />
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-start gap-2 pr-6">
        <span className={cat.color}>{cat.icon}</span>
        <div>
          <h3 className="text-sm font-bold text-white leading-tight">{role.name}</h3>
          <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{role.description}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={LEGAL_BADGE[role.legalStatus]}>
          {LEGAL_LABEL[role.legalStatus]}
        </span>
        <span className="text-xs text-gold-400 font-semibold">
          ${role.baseIncome.toLocaleString('es-AR')}/h
        </span>
        {isLocked && (
          <span className="badge bg-white/5 text-white/30 border border-white/10">
            Nivel {role.unlockLevel}
          </span>
        )}
      </div>

      {/* Risk bar */}
      <RiskBar level={role.riskLevel} />
    </motion.button>
  );
}

// Fallback demo roles when API is unavailable
const DEMO_ROLES: Role[] = [
  {
    id: 'empleado_formal', name: 'Empleado formal', description: 'Trabajo de 9 a 18 en una empresa. Sueldo fijo, aportes y poco riesgo.',
    category: 'formal', baseIncome: 8000, incomeVariance: 0.05, requiredSkills: {}, unlockLevel: 1,
    riskLevel: 1, legalStatus: 'legal', availableZones: ['microcentro', 'palermo'], mechanics: [],
  },
  {
    id: 'remisero', name: 'Remisero', description: 'Manejás tu auto por la ciudad. Los ingresos dependen de la demanda.',
    category: 'informal', baseIncome: 12000, incomeVariance: 0.3, requiredSkills: {}, unlockLevel: 1,
    riskLevel: 3, legalStatus: 'gray', availableZones: ['*'], mechanics: [],
  },
  {
    id: 'vendedor_ambulante', name: 'Vendedor ambulante', description: 'Vendés productos en la calle. Riesgo de operativos.',
    category: 'informal', baseIncome: 9500, incomeVariance: 0.4, requiredSkills: {}, unlockLevel: 1,
    riskLevel: 4, legalStatus: 'gray', availableZones: ['once', 'constitucion'], mechanics: [],
  },
  {
    id: 'policia', name: 'Policía', description: 'Mantenés el orden en los barrios. Acceso a zonas restringidas.',
    category: 'service', baseIncome: 15000, incomeVariance: 0.1, requiredSkills: { physical: 30, intelligence: 20 }, unlockLevel: 1,
    riskLevel: 5, legalStatus: 'legal', availableZones: ['*'], mechanics: [],
  },
  {
    id: 'periodista', name: 'Periodista', description: 'Cubrís la ciudad. Cada noticia real te da bonificaciones.',
    category: 'media', baseIncome: 11000, incomeVariance: 0.2, requiredSkills: { intelligence: 25 }, unlockLevel: 1,
    riskLevel: 3, legalStatus: 'legal', availableZones: ['*'], mechanics: [],
  },
  {
    id: 'politico', name: 'Político', description: 'Manipulás la opinión pública y accedés a contratos millonarios.',
    category: 'political', baseIncome: 30000, incomeVariance: 0.5, requiredSkills: { social: 40 }, unlockLevel: 5,
    riskLevel: 6, legalStatus: 'gray', availableZones: ['*'], mechanics: [],
  },
  {
    id: 'transa_barrial', name: 'Transa', description: 'Operás en la economía ilegal de los barrios. Alto riesgo, alto retorno.',
    category: 'illegal', baseIncome: 40000, incomeVariance: 0.8, requiredSkills: { street: 40 }, unlockLevel: 1,
    riskLevel: 9, legalStatus: 'illegal', availableZones: ['villa_lugano', 'la_boca', 'mataderos'], mechanics: [],
  },
  {
    id: 'medico', name: 'Médico', description: 'Atendés pacientes en hospitales y clínicas. Misiones de crisis frecuentes.',
    category: 'service', baseIncome: 25000, incomeVariance: 0.15, requiredSkills: { intelligence: 50 }, unlockLevel: 1,
    riskLevel: 2, legalStatus: 'legal', availableZones: ['*'], mechanics: [],
  },
];

export default function RoleSelectPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [filterCategory, setFilterCategory] = useState<RoleCategory | 'all'>('all');
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const { user, setUser } = useAuthStore();
  const { notify } = useUiStore();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await api.get<Role[]>('/roles');
      if (res.success && res.data && res.data.length > 0) {
        setRoles(res.data);
      } else {
        setRoles(DEMO_ROLES);
      }
      setLoadingRoles(false);
    })();
  }, []);

  const filtered = roles.filter(
    (r) => filterCategory === 'all' || r.category === filterCategory
  );

  const categories = [...new Set(roles.map((r) => r.category))];

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setSaving(true);
    const res = await api.post<typeof user>('/roles/select', { roleId: selectedRole.id });
    if (res.success && res.data) {
      setUser(res.data!);
      notify({ type: 'success', title: '¡Rol seleccionado!', message: `Ahora sos ${selectedRole.name}.` });
      navigate('/game');
    } else {
      // Allow offline play with mock user update
      if (user) {
        setUser({ ...user, roleId: selectedRole.id });
        notify({ type: 'info', title: '¡Rol seleccionado!', message: `Ahora sos ${selectedRole.name}.` });
        navigate('/game');
      } else {
        notify({ type: 'danger', title: 'Error', message: res.error ?? 'No se pudo seleccionar el rol.' });
      }
    }
    setSaving(false);
    setConfirming(false);
  };

  return (
    <div className="min-h-screen bg-brand-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-brand-800/15 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <MapPin className="w-6 h-6 text-brand-400" />
            <span className="text-white/60 text-sm font-semibold uppercase tracking-widest">CABA Online</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">¿Quién sos en la ciudad?</h1>
          <p className="text-white/50 max-w-lg mx-auto">
            Elegí tu rol inicial. Vas a poder cambiarlo más adelante cuando subas de nivel.
          </p>
        </motion.div>

        {/* Category filters */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <Filter className="w-4 h-4 text-white/30 shrink-0" />
          <button
            onClick={() => setFilterCategory('all')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              filterCategory === 'all'
                ? 'bg-brand-500/20 border-brand-400/50 text-brand-300'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                  filterCategory === cat
                    ? 'bg-brand-500/20 border-brand-400/50 text-brand-300'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
                }`}
              >
                <span className={meta.color}>{meta.icon}</span>
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Roles grid */}
        {loadingRoles ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
          >
            <AnimatePresence>
              {filtered.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  selected={selectedRole?.id === role.id}
                  onSelect={setSelectedRole}
                  userLevel={user?.level ?? 1}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Confirmation footer */}
        <AnimatePresence>
          {selectedRole && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-brand-950/90 backdrop-blur-lg border-t border-white/10"
            >
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                <div>
                  <p className="text-white/60 text-sm">Rol seleccionado</p>
                  <p className="text-white font-bold">{selectedRole.name}</p>
                </div>

                {!confirming ? (
                  <button
                    onClick={() => setConfirming(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    Confirmar elección
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-white/70 text-sm">
                      ¿Confirmas que querés ser{' '}
                      <span className="text-white font-semibold">{selectedRole.name}</span>?
                    </p>
                    <button
                      onClick={() => setConfirming(false)}
                      className="btn-secondary text-sm"
                    >
                      Cambiar
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {saving ? 'Guardando...' : 'Empezar'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
