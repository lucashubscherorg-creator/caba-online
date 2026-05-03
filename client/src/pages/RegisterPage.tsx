// ============================================
// REGISTER PAGE — CABA ONLINE
// ============================================

import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, User, Mail, Lock, AlertCircle, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface FieldError {
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

function validate(
  username: string,
  email: string,
  password: string,
  confirm: string
): FieldError {
  const errors: FieldError = {};

  if (!username.trim()) {
    errors.username = 'El nombre de usuario es requerido.';
  } else if (username.length < 3) {
    errors.username = 'Mínimo 3 caracteres.';
  } else if (username.length > 30) {
    errors.username = 'Máximo 30 caracteres.';
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = 'Solo letras, números y guiones bajos (sin guiones medios).';
  }

  if (!email.trim()) {
    errors.email = 'El email es requerido.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Email inválido.';
  }

  if (!password) {
    errors.password = 'La contraseña es requerida.';
  } else if (password.length < 8) {
    errors.password = 'Mínimo 8 caracteres.';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Debe tener al menos una letra mayúscula.';
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'Debe tener al menos un número.';
  }

  if (password !== confirm) {
    errors.confirm = 'Las contraseñas no coinciden.';
  }

  return errors;
}

function FieldHint({ error, ok }: { error?: string; ok?: boolean }) {
  if (error) {
    return (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-red-400 flex items-center gap-1 mt-1"
      >
        <AlertCircle className="w-3 h-3" />
        {error}
      </motion.p>
    );
  }
  if (ok) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-green-400 flex items-center gap-1 mt-1"
      >
        <CheckCircle className="w-3 h-3" />
        Perfecto
      </motion.p>
    );
  }
  return null;
}

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [submitted, setSubmitted] = useState(false);

  const { register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    clearError();

    const errors = validate(username, email, password, confirm);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    await register(username.trim(), email.trim().toLowerCase(), password);
  };

  const handleChange = () => {
    if (submitted) {
      setFieldErrors(validate(username, email, password, confirm));
    }
  };

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center relative overflow-hidden py-8">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-800/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-700/10 blur-3xl" />
      </div>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-400/30 mb-3 shadow-glow">
            <MapPin className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CABA Online</h1>
          <p className="text-white/40 mt-1 text-sm">Tu nueva vida porteña empieza acá.</p>
        </div>

        {/* Card */}
        <div className="card space-y-5">
          <div>
            <h2 className="text-xl font-bold text-white">Crear cuenta</h2>
            <p className="text-white/40 text-sm mt-0.5">Unite a la ciudad virtual.</p>
          </div>

          {/* API error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" onChange={handleChange}>
            {/* Username */}
            <div>
              <label className="text-xs font-medium text-white/60 uppercase tracking-wide">
                Nombre de usuario
              </label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="porteño123"
                  maxLength={30}
                  className={`input-field pl-10 ${fieldErrors.username ? 'ring-2 ring-red-500/50' : ''}`}
                  autoComplete="username"
                />
              </div>
              <FieldHint
                error={fieldErrors.username}
                ok={submitted && !fieldErrors.username && username.length >= 3}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-white/60 uppercase tracking-wide">Email</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className={`input-field pl-10 ${fieldErrors.email ? 'ring-2 ring-red-500/50' : ''}`}
                  autoComplete="email"
                />
              </div>
              <FieldHint
                error={fieldErrors.email}
                ok={submitted && !fieldErrors.email && email.length > 0}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-white/60 uppercase tracking-wide">Contraseña</label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mín. 8 chars, 1 mayúscula, 1 número"
                  className={`input-field pl-10 ${fieldErrors.password ? 'ring-2 ring-red-500/50' : ''}`}
                  autoComplete="new-password"
                />
              </div>
              <FieldHint
                error={fieldErrors.password}
                ok={submitted && !fieldErrors.password && password.length >= 8}
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-xs font-medium text-white/60 uppercase tracking-wide">
                Confirmar contraseña
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repetir contraseña"
                  className={`input-field pl-10 ${fieldErrors.confirm ? 'ring-2 ring-red-500/50' : ''}`}
                  autoComplete="new-password"
                />
              </div>
              <FieldHint
                error={fieldErrors.confirm}
                ok={submitted && !fieldErrors.confirm && confirm === password && confirm.length > 0}
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.97 }}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-white/40">
            ¿Ya tenés cuenta?{' '}
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
            >
              Iniciá sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
