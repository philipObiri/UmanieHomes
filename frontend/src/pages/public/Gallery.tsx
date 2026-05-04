import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '../../api';
import { PageHeader } from '../../components/shared/PageHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const API_BASE = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';
function imgUrl(path?: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Django media paths need the API base; root-relative static assets don't
  if (path.startsWith('/media/')) return `${API_BASE}${path}`;
  return path;
}

// Static fallback — images shipped in frontend/public/gallery/ (served at /gallery/<name>)
const STATIC_GALLERY = [
  '1-780x780.jpeg',
  '4-780x780.jpeg',
  '5-780x780.jpeg',
  '6-780x780.jpeg',
  '7-780x780.jpeg',
  '8--780x780.jpeg',
  '9-780x780.jpeg',
  '9-780x780 (1).jpeg',
  '10-780x780.jpeg',
  '11-780x780.jpeg',
  '12-780x780.jpeg',
  '13-780x780.jpeg',
  '15-780x780.jpeg',
  'IMG-20251217-WA0156-780x780.jpg',
  'IMG-20251217-WA0157-780x780.jpg',
  'IMG-20251217-WA0159-780x720.jpg',
  'IMG-20251217-WA0161-780x720.jpg',
  'IMG-20251217-WA0165-780x607.jpg',
  'IMG-20251217-WA0167-780x780.jpg',
  'IMG-20251217-WA0168-780x780.jpg',
  'IMG-20251217-WA0169-780x607.jpg',
  'IMG-20251217-WA0172-780x720.jpg',
  'IMG-20251217-WA0173-780x720.jpg',
  'IMG-20251217-WA0174-780x720.jpg',
  'IMG-20251217-WA0182-780x780.jpg',
  'IMG-20251217-WA0188-780x780.jpg',
  'IMG-20251217-WA0190-780x780.jpg',
  'IMG-20251217-WA0192-780x780.jpg',
  'IMG-20251217-WA0195-780x780.jpg',
  'IMG-20251217-WA0204-780x780.jpg',
  'IMG-20251217-WA0208-780x780.jpg',
].map((name, i) => ({ id: i, url: `/gallery/${name}`, name }));

export function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const pageRef = useScrollReveal();

  const { data, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => cmsApi.media({ file_type: 'image' }),
  });

  const apiImages = data?.results ?? [];
  const images = apiImages.length > 0 ? apiImages : STATIC_GALLERY;

  const prev = () => setLightboxIdx((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const next = () => setLightboxIdx((i) => (i !== null ? (i + 1) % images.length : null));

  return (
    <div ref={pageRef} id="main-content">
      <PageHeader
        title="Photo Gallery"
        subtitle="Explore our portfolio of premium properties and construction progress."
        bgImage="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1920&q=80"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Gallery' }]}
      />

      <section className="section">
        <div className="container">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}>
              {images.map((img: { id: number; url?: string; file?: string; name?: string }, i: number) => (
                <div
                  key={img.id}
                  onClick={() => setLightboxIdx(i)}
                  style={{
                    aspectRatio: '4/3', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                    cursor: 'pointer', position: 'relative', background: 'var(--color-surface-2)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
                    (e.currentTarget.querySelector('.overlay') as HTMLElement | null)!.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'none';
                    (e.currentTarget.querySelector('.overlay') as HTMLElement | null)!.style.opacity = '0';
                  }}
                >
                  <img
                    src={imgUrl(img.url || img.file)}
                    alt={img.name || `Gallery image ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    className="overlay"
                    style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,66,116,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.2s', color: '#fff',
                      fontSize: '0.875rem', fontWeight: 600,
                    }}
                  >
                    View Fullscreen
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIdx !== null && images[lightboxIdx] && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            style={{ position: 'absolute', left: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
          >
            <ChevronLeft size={24} />
          </button>
          <img
            src={imgUrl((images[lightboxIdx] as any).url || (images[lightboxIdx] as any).file)}
            alt=""
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 'var(--radius-lg)' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            style={{ position: 'absolute', right: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
          >
            <ChevronRight size={24} />
          </button>
          <button
            onClick={() => setLightboxIdx(null)}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} />
          </button>
          <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
            {lightboxIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
