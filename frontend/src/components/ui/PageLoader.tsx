export function PageLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-color)',
      gap: '1.5rem',
    }}>
      {/* Spinning ring */}
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '3px solid var(--border-color)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: 'var(--accent-gold, #C49E56)',
          animation: 'page-spin 0.8s linear infinite',
        }} />
        {/* Inner dot */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 10, height: 10, borderRadius: '50%',
          background: 'var(--accent-gold, #C49E56)',
          animation: 'page-pulse 0.8s ease-in-out infinite alternate',
        }} />
      </div>

      {/* Brand text */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'var(--accent-gold, #C49E56)',
          animation: 'page-fade 1.2s ease-in-out infinite alternate',
        }}>
          Umanie Homes Africa
        </p>
      </div>

      <style>{`
        @keyframes page-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes page-pulse {
          from { opacity: 0.4; transform: translate(-50%, -50%) scale(0.8); }
          to   { opacity: 1;   transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes page-fade {
          from { opacity: 0.5; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function SectionLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem', gap: '0.75rem', flexDirection: 'column' }}>
      <div style={{ position: 'relative', width: 44, height: 44 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid var(--border-color)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--accent-gold, #C49E56)', animation: 'page-spin 0.8s linear infinite' }} />
      </div>
      <style>{`@keyframes page-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
