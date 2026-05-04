import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Bed, Bath, Maximize, MapPin, ArrowLeft, Phone, Mail, ChevronLeft, ChevronRight, Check, ParkingSquare } from 'lucide-react';
import { propertiesApi } from '../../api';
import { toast } from '../../components/ui/Toast';
import { useTenantStore } from '../../stores/tenantStore';

const API_BASE = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';
function imgUrl(path?: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

export function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { tenant } = useTenantStore();
  const [activeImg, setActiveImg] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.get(id!),
    enabled: !!id,
  });

  const inquire = useMutation({
    mutationFn: (data: typeof form) => propertiesApi.inquire(id!, data),
    onSuccess: () => {
      toast.success('Your inquiry has been submitted! We\'ll be in touch shortly.');
      setForm({ name: '', email: '', phone: '', message: '' });
    },
    onError: () => toast.error('Failed to submit inquiry. Please try again.'),
  });

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
    </div>
  );

  if (!property) return (
    <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--color-text-muted)' }}>
      <h2>Property not found</h2>
      <Link to="/listings" style={{ color: 'var(--color-primary)', marginTop: '1rem', display: 'inline-block' }}>Back to Listings</Link>
    </div>
  );

  const images = property.images || [];
  const currentImg = images[activeImg];

  const formatPrice = (price: string, currency: string) => {
    const num = parseFloat(price);
    return `${currency} ${num.toLocaleString()}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inquire.mutate(form);
  };

  const primaryImgUrl = images[0]?.image ? imgUrl(images[0].image) : '';

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* ===== PROPERTY HEADER ===== */}
      <div style={{
        position: 'relative',
        background: primaryImgUrl
          ? `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.82) 100%), url(${primaryImgUrl}) center/cover no-repeat`
          : 'linear-gradient(160deg, #0a0a0a 0%, #0a1f44 100%)',
        padding: '7rem 0 3.5rem',
        marginBottom: '0',
        minHeight: 380,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}>
        {/* Breadcrumb */}
        <div className="container" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
            <span>/</span>
            <Link to="/listings" style={{ color: 'rgba(255,255,255,0.7)' }}>Listings</Link>
            <span>/</span>
            <span style={{ color: '#fff' }}>{property.title}</span>
          </div>
        </div>

        <div className="container">
          {/* Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span style={{ background: 'var(--accent-gold)', color: '#fff', padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {property.property_type_display}
            </span>
            <span style={{ background: property.status === 'available' ? '#10b981' : 'rgba(255,255,255,0.25)', color: '#fff', padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
              {property.status_display}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
              {property.listing_type === 'sale' ? 'For Sale' : property.listing_type === 'rent' ? 'For Rent' : 'Sale / Rent'}
            </span>
            {property.reference_id && (
              <span style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem' }}>
                Ref: {property.reference_id}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.75rem)', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {property.title}
          </h1>

          {/* Location + Price row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>
              <MapPin size={16} color="var(--accent-gold)" />
              <span>{[property.area, property.city, property.country].filter(Boolean).join(', ')}</span>
            </div>
            <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--accent-gold)', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {formatPrice(property.price, property.currency)}
            </div>
          </div>

        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem' }}>
        <Link to="/listings" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Listings
        </Link>

        <div className="detail-grid">
          {/* Left: Images + details */}
          <div>
            {/* Main image */}
            <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '16/9', background: 'var(--color-surface-2)', marginBottom: '0.75rem' }}>
              {currentImg ? (
                <img src={imgUrl(currentImg.image)} alt={currentImg.caption || property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '4rem' }}>🏠</div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={20} />
                  </button>
                  <span style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}>
                    {activeImg + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImg(i)}
                    style={{
                      flexShrink: 0, width: 80, height: 56,
                      borderRadius: 'var(--radius-md)', overflow: 'hidden',
                      border: `2px solid ${i === activeImg ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer', padding: 0,
                    }}
                  >
                    <img src={imgUrl(img.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Quick-spec strip */}
            <div style={{ display: 'flex', gap: '0', marginTop: '1.25rem', marginBottom: '2rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              {[
                property.bedrooms > 0 && { icon: <Bed size={18} color="var(--color-accent)" />, value: property.bedrooms, label: 'Bedrooms' },
                property.bathrooms > 0 && { icon: <Bath size={18} color="var(--color-accent)" />, value: property.bathrooms, label: 'Bathrooms' },
                property.sqft > 0 && { icon: <Maximize size={18} color="var(--color-accent)" />, value: `${property.sqft.toLocaleString()} ft²`, label: 'Area' },
                property.parking_spaces > 0 && { icon: <ParkingSquare size={18} color="var(--color-accent)" />, value: property.parking_spaces, label: 'Parking' },
              ].filter(Boolean).map((spec: any, i, arr) => (
                <div key={spec.label} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '1rem 0.5rem', gap: '0.3rem',
                  borderRight: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                  {spec.icon}
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)' }}>{spec.value}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{spec.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>Description</h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{property.description}</p>
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>Features & Amenities</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.625rem' }}>
                  {property.features.map((feature) => (
                    <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                      <Check size={16} color="var(--color-success)" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Inquiry form + agent */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1.5rem)' }}>
            {/* Inquiry form */}
            <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text)' }}>
                Request Information
              </h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name *"
                  style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.9rem', outline: 'none' }} />
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email address *"
                  style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.9rem', outline: 'none' }} />
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone number"
                  style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.9rem', outline: 'none' }} />
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="I'm interested in this property..."
                  rows={4}
                  style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }} />
                <button
                  type="submit"
                  disabled={inquire.isPending}
                  style={{
                    padding: '0.875rem', background: 'var(--color-primary)', color: '#fff',
                    border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer',
                    fontSize: '1rem', opacity: inquire.isPending ? 0.7 : 1,
                  }}
                >
                  {inquire.isPending ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            </div>

            {/* Agent card */}
            {property.assigned_agent && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Listed by</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-surface-2)', overflow: 'hidden', border: '2px solid var(--color-accent)', flexShrink: 0 }}>
                    {property.assigned_agent.avatar ? (
                      <img src={imgUrl(property.assigned_agent.avatar)} alt={property.assigned_agent.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.25rem' }}>
                        {property.assigned_agent.full_name?.charAt(0) ?? '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>{property.assigned_agent.full_name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Property Agent</p>
                  </div>
                </div>
                {property.assigned_agent.phone && (
                  <a href={`tel:${property.assigned_agent.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <Phone size={14} /> {property.assigned_agent.phone}
                  </a>
                )}
                {property.assigned_agent.email && (
                  <a href={`mailto:${property.assigned_agent.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                    <Mail size={14} /> {property.assigned_agent.email}
                  </a>
                )}
              </div>
            )}

            {/* Contact info */}
            {tenant?.contact_phone && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-accent)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.25rem' }}>Call us directly</p>
                <a href={`tel:${tenant.contact_phone}`} style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fff' }}>
                  {tenant.contact_phone}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .listing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
