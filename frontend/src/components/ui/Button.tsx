import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const styles: Record<string, string> = {
  base: 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-sm',
  secondary: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] shadow-sm',
  outline: 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white',
  ghost: 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]',
  danger: 'bg-[var(--color-error)] text-white hover:opacity-90',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${styles.base} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : icon}
      {children}
    </button>
  );
}
