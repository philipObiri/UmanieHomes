import { Link, useNavigate } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, Heart, Star } from 'lucide-react';
import { useState } from 'react';
import type { Property } from '../../types';

const API_BASE = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';

// Static fallback images for known property types — served from frontend/public/gallery/
const STATIC_PROPERTY_IMAGES: Record<string, string> = {
  duplex:   '/gallery/1-780x780.jpeg',
  bungalow: '/gallery/IMG-20251217-WA0208-780x780.jpg',
  villa:    '/gallery/IMG-20251217-WA0204-780x780.jpg',
  apartment: '/gallery/IMG-20251217-WA0195-780x780.jpg',
  default:  '/gallery/IMG-20251217-WA0188-780x780.jpg',
};

function resolveImage(primary_image?: string | null, property_type?: string): string | null {
  if (primary_image) {
    return primary_image.startsWith('http') ? primary_image : `${API_BASE}${primary_image}`;
  }
  return STATIC_PROPERTY_IMAGES[property_type || ''] ?? STATIC_PROPERTY_IMAGES.default;
}

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const detailUrl = `/listings/${property.slug || property.id}`;

  const imageUrl = resolveImage(property.primary_image, property.property_type);

  const formatPrice = (price: string, currency: string) => {
    const num = parseFloat(price);
    if (num >= 1_000_000) return `${currency} ${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${currency} ${(num / 1_000).toFixed(0)}K`;
    return `${currency} ${num.toLocaleString()}`;
  };

  return (
    <div
      className="card"
      onClick={() => navigate(detailUrl)}
      style={{
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        position: 'relative',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Image — overflow hidden clips only the photo, not the badges */}
      <div style={{ position: 'relative', aspectRatio: '16/10', background: 'var(--color-surface-2)' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit' }}>
          <img
            src={imageUrl!}
            alt={property.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          />
        </div>

        {/* Badges — outside overflow:hidden so they never get clipped */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.3rem', flexWrap: 'nowrap', maxWidth: 'calc(100% - 3.5rem)', zIndex: 2, overflow: 'hidden' }}>
          {property.is_featured && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              background: 'var(--accent-gold, #C49E56)',
              color: '#fff',
              padding: '0.25rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.6rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(196,158,86,0.45)',
            }}>
              <Star size={9} fill="#fff" color="#fff" /> Featured
            </span>
          )}
          <span className="badge" style={{
            fontSize: '0.65rem', whiteSpace: 'nowrap',
            background: property.status === 'available' ? 'var(--color-success)' : 'rgba(0,0,0,0.6)',
            color: '#fff'
          }}>
            {property.status_display}
          </span>
          <span className="badge" style={{ fontSize: '0.65rem', whiteSpace: 'nowrap', background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
            {property.listing_type === 'sale' ? 'For Sale' : property.listing_type === 'rent' ? 'For Rent' : 'Sale/Rent'}
          </span>
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked((v) => !v); }}
          style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 2,
            width: 36, height: 36, borderRadius: '50%',
            background: liked ? 'var(--color-error)' : 'rgba(255,255,255,0.9)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <Heart size={16} fill={liked ? '#fff' : 'none'} color={liked ? '#fff' : 'var(--color-error)'} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3 }}>
            <Link to={`/listings/${property.slug || property.id}`} style={{ color: 'inherit' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}>
              {property.title}
            </Link>
          </h3>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
              {formatPrice(property.price, property.currency)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          <MapPin size={13} />
          <span>{[property.area, property.city, property.country].filter(Boolean).join(', ')}</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.875rem', borderTop: '1px solid var(--color-border)' }}>
          {property.bedrooms > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              <Bed size={15} />
              <span>{property.bedrooms} Bed{property.bedrooms !== 1 ? 's' : ''}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              <Bath size={15} />
              <span>{property.bathrooms} Bath{property.bathrooms !== 1 ? 's' : ''}</span>
            </div>
          )}
          {property.sqft > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              <Maximize size={15} />
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
