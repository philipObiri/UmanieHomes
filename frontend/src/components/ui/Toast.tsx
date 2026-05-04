import { create } from 'zustand';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface ToastState {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().add({ type: 'success', message }),
  error: (message: string) => useToastStore.getState().add({ type: 'error', message }),
  warning: (message: string) => useToastStore.getState().add({ type: 'warning', message }),
  info: (message: string) => useToastStore.getState().add({ type: 'info', message }),
};

const icons = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertCircle size={18} />,
  info: <Info size={18} />,
};

const colors = {
  success: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
  error: { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d' },
  warning: { bg: '#fef3c7', border: '#f59e0b', text: '#78350f' },
  info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a5f' },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const c = colors[toast.type];
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        background: c.bg, border: `1px solid ${c.border}`, color: c.text,
        borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem',
        boxShadow: 'var(--shadow-md)', animation: 'fadeIn 0.25s ease',
        maxWidth: '380px', width: '100%',
      }}
    >
      <span style={{ color: c.border, flexShrink: 0, marginTop: '1px' }}>{icons[toast.type]}</span>
      <p style={{ fontSize: '0.875rem', flex: 1, lineHeight: 1.5 }}>{toast.message}</p>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, opacity: 0.7, flexShrink: 0 }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore();
  return (
    <div
      style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem',
        alignItems: 'flex-end',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
      ))}
    </div>
  );
}
