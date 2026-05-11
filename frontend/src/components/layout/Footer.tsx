import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useTenantStore } from '../../stores/tenantStore';
const uhaLogo = '/main_logo.png';

const quickLinks = [
  { label: 'Browse Properties', to: '/listings' },
  { label: 'About Us', to: '/about' },
  { label: 'Our Team', to: '/team' },
  { label: 'Market Insights', to: '/insights' },
  { label: 'Property Gallery', to: '/gallery' },
  { label: 'Contact Us', to: '/contact' },
];

const propertyTypes = [
  { label: 'Bungalows', to: '/listings?type=bungalow' },
  { label: 'Duplexes', to: '/listings?type=duplex' },
  { label: 'Apartments', to: '/listings?type=apartment' },
  { label: 'Villas', to: '/listings?type=villa' },
  { label: 'Mansions', to: '/listings?type=mansion' },
  { label: 'Estates', to: '/listings?type=estate' },
];

export function Footer() {
  const { tenant } = useTenantStore();

  return (
    <footer className="site-footer">
      <div className="footer-main">
        {/* Brand column */}
        <div className="footer-column">
          <img src={uhaLogo} alt={tenant?.name || 'Umanie Homes Africa'}
            style={{ height: 52, width: 'auto', objectFit: 'contain', marginBottom: '0.75rem' }} />
          <p>
            Explore premium homes and high-value investment opportunities across Africa's fastest-growing locations.
          </p>
          <div className="footer-social">
            {/* Facebook */}
            <a href="#" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            {/* Twitter/X */}
            <a href="#" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            {quickLinks.map(({ label, to }) => (
              <li key={to}>
                <Link to={to}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: 'var(--accent-gold)', flexShrink: 0 }}>
                    <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Property Types */}
        <div className="footer-column">
          <h3>Property Types</h3>
          <ul className="footer-links">
            {propertyTypes.map(({ label, to }) => (
              <li key={to}>
                <Link to={to}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: 'var(--accent-gold)', flexShrink: 0 }}>
                    <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-column">
          <h3>Contact Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(tenant?.contact_phone || '+233 54 969 5146') && (
              <div className="footer-contact-item">
                <Phone size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: 2 }} />
                <a href={`tel:${tenant?.contact_phone || '+233549695146'}`}>
                  {tenant?.contact_phone || '+233 54 969 5146'}
                </a>
              </div>
            )}
            {(tenant?.contact_email || 'info@umaniehomesafrica.com') && (
              <div className="footer-contact-item">
                <Mail size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: 2 }} />
                <a href={`mailto:${tenant?.contact_email || 'info@umaniehomesafrica.com'}`}>
                  {tenant?.contact_email || 'info@umaniehomesafrica.com'}
                </a>
              </div>
            )}
            <div className="footer-contact-item">
                <MapPin size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {tenant?.address
                    ? `${tenant.address}${tenant.city ? `, ${tenant.city}` : ''}`
                    : 'Hans Plaza, 2nd Floor, along Sakumono-Lashibi Road'}
                </span>
              </div>
            <div className="footer-contact-item">
              <Clock size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: 2 }} />
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                {tenant?.business_hours || 'Mon - Fri: 7:00 AM - 7:00 PM'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()}{' '}
          <Link to="/">{tenant?.name || 'Umanie Homes Africa'}</Link>. All rights reserved.
        </p>
        <ul className="footer-bottom-links">
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
          <li><a href="#">Cookie Policy</a></li>
        </ul>
      </div>
    </footer>
  );
}
