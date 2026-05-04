import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = { sm: '400px', md: '560px', lg: '720px', xl: '960px' };

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
          maxWidth: sizeMap[size],
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text)' }}>{title}</h3>
            <button
              onClick={onClose}
              style={{
                padding: '0.25rem', borderRadius: '50%', border: 'none',
                background: 'transparent', color: 'var(--color-text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
}
