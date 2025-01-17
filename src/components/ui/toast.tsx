// src/components/ui/toast.tsx
import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error';
  title: string;
  message: string;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const Icon = toast.type === 'success' ? CheckCircle2 : XCircle;
  const colorClass = toast.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20';
  const borderClass = toast.type === 'success' ? 'border-green-500/20' : 'border-red-500/20';
  const textClass = toast.type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      className={`${colorClass} rounded-lg shadow-lg p-4 mb-4 cursor-pointer crystal-bg border ${borderClass}`}
      onClick={() => onDismiss(toast.id)}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-6 h-6 ${textClass}`} />
        <div className="flex-1">
          <h4 className={`font-semibold ${textClass}`}>{toast.title}</h4>
          <p className="text-slate-200 text-sm">{toast.message}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const ToastContainer: React.FC<{
  toasts: Toast[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-24 right-4 flex flex-col items-end z-50 max-w-md w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};