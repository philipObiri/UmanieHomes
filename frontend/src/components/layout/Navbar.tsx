import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTenantStore } from '../../stores/tenantStore';
import { useAuthStore } from '../../stores/authStore';
const uhaLogo = '/main_logo.png';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Properties', to: '/listings' },
  { label: 'About', to: '/about' },
  { label: 'Team', to: '/team' },
  { label: 'Insights', to: '/insights' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
];

export function Navbar() {
  const { tenant, theme } = useTenantStore();
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <a href="#main-content" className="skip-to-main"
        style={{ position: 'absolute', top: -100, left: 0, background: 'var(--brand-deep)', color: 'white', padding: '10px 20px', zIndex: 1400 }}>
        Skip to main content
      </a>

      <nav className={`site-nav${scrolled ? ' scrolled' : ''}`} id="mainNav">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <img
            src={theme?.logo || uhaLogo}
            alt={tenant?.name || 'Umanie Homes Africa'}
            style={{ height: 58, width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        {/* Desktop nav links */}
        <ul className="nav-links-list">
          {navLinks.map(({ label, to }) => (
            <li key={to}>
              <Link
                to={to}
                className={location.pathname === to || (to !== '/' && location.pathname.startsWith(to)) ? 'active' : ''}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="nav-actions">
          <Link to="/contact" className="btn btn-primary" style={{ padding: '10px 20px' }}>
            Book Tour
          </Link>

          {isAuthenticated && (
            <Link to="/dashboard" className="btn btn-outline" style={{ padding: '10px 20px' }}>
              Dashboard
            </Link>
          )}

          {/* Hamburger */}
          <button
            className={`hamburger${mobileOpen ? ' active' : ''}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`mobile-menu-overlay${mobileOpen ? ' active' : ''}`} role="navigation">
        <ul className="nav-links-list">
          {navLinks.map(({ label, to }) => (
            <li key={to}>
              <Link
                to={to}
                className={location.pathname === to ? 'active' : ''}
                onClick={closeMobile}
              >
                {label}
              </Link>
            </li>
          ))}
          {isAuthenticated && (
            <li>
              <Link to="/dashboard" onClick={closeMobile} style={{ color: 'var(--accent-gold)' }}>
                Dashboard
              </Link>
            </li>
          )}
        </ul>
      </div>
      <div
        className={`mobile-backdrop${mobileOpen ? ' active' : ''}`}
        onClick={closeMobile}
        aria-hidden="true"
      />
    </>
  );
}
