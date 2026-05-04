import { Link } from 'react-router-dom';

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  bgImage: string;
  breadcrumbs?: Crumb[];
}

export function PageHeader({ title, subtitle, bgImage, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div
        className="page-header-bg"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="page-header-overlay" />
      <div className="page-header-content">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="page-header-breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'nowrap',
              gap: '4px',
              marginTop: '16px',
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.75)',
              whiteSpace: 'nowrap',
            }}
          >
            {breadcrumbs.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {i > 0 && <span style={{ opacity: 0.5 }}>›</span>}
                {crumb.to ? (
                  <Link to={crumb.to} style={{ color: 'var(--accent-gold)' }}>{crumb.label}</Link>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
