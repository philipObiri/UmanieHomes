import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from '../../components/ui/Toast';
import { useTenantStore } from '../../stores/tenantStore';

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const { tenant } = useTenantStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Invalid email or password.';
      toast.error(msg);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-block' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              {tenant?.name || 'Umanie Homes Africa'}
            </h1>
            {tenant?.tagline && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                {tenant.tagline}
              </p>
            )}
          </Link>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.375rem' }}>Sign In</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Access the ERP dashboard
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Email</label>
              <input
                required type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  required type={showPass ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.75rem 2.75rem 0.75rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none' }}
                />
                <button
                  type="button" onClick={() => setShowPass((v) => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={isLoading}
              style={{
                padding: '0.875rem', marginTop: '0.5rem',
                background: 'var(--color-primary)', color: '#fff',
                border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer',
                fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <LogIn size={18} />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
