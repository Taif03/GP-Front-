import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string, withSound?: boolean) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const showToast = useCallback((type: ToastType, title: string, message?: string, withSound?: boolean) => {
    const id = `toast-${++idCounter.current}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (withSound) {
      playAlertSound();
    }

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 w-[360px] max-w-[calc(100vw-2rem)]">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config = {
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-400',
      border: 'border-emerald-500/40',
      bg: 'dark:bg-emerald-950/90 bg-emerald-50',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-400',
      border: 'border-amber-500/40',
      bg: 'dark:bg-amber-950/90 bg-amber-50',
    },
    info: {
      icon: Info,
      color: 'text-sky-400',
      border: 'border-sky-500/40',
      bg: 'dark:bg-sky-950/90 bg-sky-50',
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} backdrop-blur-md border rounded-xl p-4 shadow-2xl flex items-start gap-3 animate-slide-in`}
    >
      <Icon className={`${config.color} shrink-0 mt-0.5`} size={22} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold dark:text-emerald-50 text-gray-900">{toast.title}</p>
        {toast.message && (
          <p className="text-xs dark:text-emerald-100/70 text-gray-600 mt-1">{toast.message}</p>
        )}
      </div>
      <button onClick={onDismiss} className="dark:text-emerald-200/50 text-gray-400 hover:opacity-70 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, now + start);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.15, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
      osc.start(now + start);
      osc.stop(now + start + duration);
    };

    playTone(880, 0, 0.15);
    playTone(1100, 0.18, 0.15);
    playTone(1320, 0.36, 0.2);

    setTimeout(() => ctx.close(), 700);
  } catch {
    // AudioContext may not be available
  }
}
