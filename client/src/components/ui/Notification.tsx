// ============================================
// NOTIFICATION TOAST SYSTEM — CABA ONLINE
// ============================================

import { AnimatePresence, motion } from 'framer-motion';
import { X, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useUiStore, type Notification, type NotificationType } from '../../store/uiStore';

const ICONS: Record<NotificationType, React.ReactNode> = {
  info:    <Info className="w-4 h-4" />,
  success: <CheckCircle className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  danger:  <XCircle className="w-4 h-4" />,
};

const COLORS: Record<NotificationType, string> = {
  info:    'border-l-brand-400 text-brand-300',
  success: 'border-l-green-400 text-green-400',
  warning: 'border-l-yellow-400 text-yellow-400',
  danger:  'border-l-red-400 text-red-400',
};

function NotificationItem({ notification }: { notification: Notification }) {
  const { dismissNotification } = useUiStore();
  const colorClass = COLORS[notification.type];

  return (
    <motion.div
      layout
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 120, opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`glass rounded-xl p-4 max-w-sm border-l-4 shadow-card flex gap-3 items-start ${colorClass}`}
    >
      <span className="mt-0.5 shrink-0">{ICONS[notification.type]}</span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">{notification.title}</p>
        {notification.message && (
          <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{notification.message}</p>
        )}
      </div>

      <button
        onClick={() => dismissNotification(notification.id)}
        className="shrink-0 text-white/40 hover:text-white/80 transition-colors mt-0.5"
        aria-label="Cerrar notificación"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default function NotificationContainer() {
  const { notifications } = useUiStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <NotificationItem notification={n} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
