import React from 'react';
import { useToastStore } from '../context/toastStore';
import type { ToastItem } from '../context/toastStore';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  let icon = <Info className="w-5 h-5 text-primary" />;
  let borderClass = 'border-primary/20';
  let progressBg = 'bg-primary';

  switch (toast.type) {
    case 'success':
      icon = <CheckCircle2 className="w-5 h-5 text-success" />;
      borderClass = 'border-success/20';
      progressBg = 'bg-success';
      break;
    case 'warning':
      icon = <AlertTriangle className="w-5 h-5 text-warning" />;
      borderClass = 'border-warning/20';
      progressBg = 'bg-warning';
      break;
    case 'error':
      icon = <XCircle className="w-5 h-5 text-danger" />;
      borderClass = 'border-danger/20';
      progressBg = 'bg-danger';
      break;
  }

  return (
    <div className={`relative glass-card border p-4 flex gap-3 items-start overflow-hidden animate-slide-up ${borderClass}`}>
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-grow text-sm text-text-primary pr-4">{toast.message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors active:scale-95"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-border">
        <div 
          className={`h-full ${progressBg}`} 
          style={{
            animation: 'shrinkProgress 4s linear forwards'
          }}
        />
      </div>

      <style>{`
        @keyframes shrinkProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
