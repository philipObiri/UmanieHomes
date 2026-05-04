import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, hint, icon, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)', pointerEvents: 'none'
          }}>
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={className}
          style={{
            width: '100%',
            padding: icon ? '0.625rem 0.875rem 0.625rem 2.5rem' : '0.625rem 0.875rem',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-error)' : 'var(--color-primary)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-error)' : 'var(--color-border)';
            props.onBlur?.(e);
          }}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{hint}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={className}
        style={{
          width: '100%',
          padding: '0.625rem 0.875rem',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
          fontSize: '1rem',
          outline: 'none',
          resize: 'vertical',
          minHeight: '100px',
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{error}</span>}
    </div>
  );
}
