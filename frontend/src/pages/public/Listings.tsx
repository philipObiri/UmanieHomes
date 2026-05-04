import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { propertiesApi } from '../../api';
import { PropertyCard } from '../../components/shared/PropertyCard';
import { PageHeader } from '../../components/shared/PageHeader';

const PROPERTY_TYPES = ['villa', 'bungalow', 'duplex', 'penthouse', 'apartment', 'mansion', 'estate', 'townhouse', 'studio', 'land'];
const CURRENCIES = ['GHS', 'USD', 'EUR', 'GBP', 'NGN', 'KES', 'ZAR'];
const BEDROOMS = [1, 2, 3, 4, 5];

export function Listings() {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const filters = {
    search: params.get('search') || '',
    listing_type: params.get('listing_type') || '',
    property_type: params.get('property_type') || '',
    currency: params.get('currency') || '',
    min_price: params.get('min_price') || '',
    max_price: params.get('max_price') || '',
    bedrooms: params.get('bedrooms') || '',
    city: params.get('city') || '',
  };

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
    setPage(1);
  };

  const clearFilters = () => { setParams({}); setPage(1); };
  const hasFilters = Object.values(filters).some(Boolean);

  const { data, isLoading } = useQuery({
    queryKey: ['listings', { ...filters, page }],
    queryFn: () => propertiesApi.list({ ...filters, page }),
  });

  const properties = data?.results || [];
  const totalPages = data ? Math.ceil(data.count / 12) : 0;

  return (
    <div id="main-content">
      <PageHeader
        title="Property Listings"
        subtitle={`${data?.count || 0} ${data?.count === 1 ? 'property' : 'properties'} available`}
        bgImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Properties' }]}
      />

      <div className="container" style={{ padding: '2rem 7%' }}>
        {/* Search + filter bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search properties..."
              style={{
                width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none',
              }}
            />
          </div>
          <select
            value={filters.listing_type}
            onChange={(e) => updateFilter('listing_type', e.target.value)}
            style={{ padding: '0.75rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', cursor: 'pointer' }}
          >
            <option value="">All Types</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.25rem', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', background: showFilters ? 'var(--color-primary)' : 'var(--color-bg)',
              color: showFilters ? '#fff' : 'var(--color-text)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            <SlidersHorizontal size={16} />
            Filters {hasFilters && `(${Object.values(filters).filter(Boolean).length})`}
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.75rem 1rem', border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-md)', background: 'transparent',
                color: 'var(--color-error)', cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem',
          }}>
            <select value={filters.property_type} onChange={(e) => updateFilter('property_type', e.target.value)}
              style={{ padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
              <option value="">All Property Types</option>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <select value={filters.bedrooms} onChange={(e) => updateFilter('bedrooms', e.target.value)}
              style={{ padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
              <option value="">Any Bedrooms</option>
              {BEDROOMS.map((b) => <option key={b} value={b}>{b}+ Bedrooms</option>)}
            </select>
            <select value={filters.currency} onChange={(e) => updateFilter('currency', e.target.value)}
              style={{ padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
              <option value="">Any Currency</option>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={filters.min_price} onChange={(e) => updateFilter('min_price', e.target.value)}
              placeholder="Min Price"
              style={{ padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
            <input value={filters.max_price} onChange={(e) => updateFilter('max_price', e.target.value)}
              placeholder="Max Price"
              style={{ padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
            <input value={filters.city} onChange={(e) => updateFilter('city', e.target.value)}
              placeholder="City"
              style={{ padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>No properties found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid-3">
            {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: '0.5rem 0.875rem', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: page === p ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: page === p ? '#fff' : 'var(--color-text)',
                  cursor: 'pointer', fontWeight: page === p ? 700 : 400,
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
