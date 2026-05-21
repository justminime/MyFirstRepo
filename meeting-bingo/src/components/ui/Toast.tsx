import { useEffect } from 'react';
import { cn } from '../../lib/utils';
import type { Toast } from '../../types';

interface Props {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: Props) {
  const visible = toasts.slice(-3);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {visible.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration ?? 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={cn(
        'rounded-lg px-4 py-2 text-sm font-medium shadow-lg',
        toast.type === 'success' && 'bg-green-500 text-white',
        toast.type === 'info' && 'bg-blue-500 text-white',
        toast.type === 'warning' && 'bg-amber-500 text-white',
      )}
    >
      {toast.message}
    </div>
  );
}
