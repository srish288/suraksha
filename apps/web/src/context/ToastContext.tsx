import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ToastMessage } from '../types';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const duration = toast.duration ?? 4500;

      const newToast: ToastMessage = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message: string, title: string = 'Success') => {
      addToast({ type: 'success', title, message });
    },
    [addToast]
  );

  const showError = useCallback(
    (message: string, title: string = 'Action Failed') => {
      addToast({ type: 'error', title, message, duration: 6000 });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (message: string, title: string = 'Notice') => {
      addToast({ type: 'warning', title, message, duration: 5500 });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (message: string, title: string = 'Information') => {
      addToast({ type: 'info', title, message });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
      }}
    >
      {children}

      {/* Floating Accessible Toast Notifications */}
      <aside
        aria-label="Notification alerts"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((toast) => {
          const bgColors = {
            success: 'bg-emerald-900/95 text-white border-emerald-700',
            error: 'bg-rose-950/95 text-white border-rose-800',
            warning: 'bg-amber-950/95 text-amber-100 border-amber-800',
            info: 'bg-slate-900/95 text-white border-slate-700'
          };

          const icons = {
            success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
            info: <Info className="w-5 h-5 text-sky-400 shrink-0" />
          };

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${bgColors[toast.type]}`}
            >
              {icons[toast.type]}
              <div className="flex-1 text-sm">
                {toast.title && <h3 className="font-semibold">{toast.title}</h3>}
                <p className="mt-0.5 text-xs text-slate-200 leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
