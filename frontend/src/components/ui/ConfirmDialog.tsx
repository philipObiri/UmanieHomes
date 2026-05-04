import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          width: '100%', maxWidth: 420,
          padding: '2rem',
          animation: 'confirmIn 0.18s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(0,66,116,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <AlertTriangle size={24} color={danger ? '#ef4444' : '#004274'} />
        </div>

        {/* Text */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', textAlign: 'center', marginBottom: '0.5rem' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', textAlign: 'center', lineHeight: 1.6 }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.625rem', borderRadius: '8px',
              border: '1px solid #e2e8f0', background: '#fff',
              color: '#475569', fontWeight: 600, fontSize: '0.875rem',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            style={{
              flex: 1, padding: '0.625rem', borderRadius: '8px',
              border: 'none',
              background: danger ? '#ef4444' : '#004274',
              color: '#fff', fontWeight: 600, fontSize: '0.875rem',
              cursor: 'pointer', transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confirmIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
