import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Eye, ArrowRight, User } from 'lucide-react';
import { cmsApi } from '../../api';
import { PageHeader } from '../../components/shared/PageHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const API_BASE = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';
function imgUrl(path?: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function Insights() {
  const [page] = useState(1);
  const pageRef = useScrollReveal();

  const { data, isLoading } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => cmsApi.posts({ page }),
  });

  const posts = data?.results || [];

  return (
    <div ref={pageRef} id="main-content">
      <PageHeader
        title="Real Estate Insights"
        subtitle="Expert insights, market trends, and guides to help you make informed real estate decisions."
        bgImage="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1920&q=80"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Insights' }]}
      />

      <section className="section">
        <div className="container">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ color: 'var(--color-text-secondary)' }}>No posts yet</h3>
              <p>Check back soon for expert insights and market updates.</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {posts[0] && (
                <div className="card insights-featured" style={{ overflow: 'hidden', marginBottom: '3rem' }}>
                  <div style={{ background: 'var(--color-surface-2)', overflow: 'hidden', minHeight: 220 }}>
                    {(posts[0] as any).featured_image_url ? (
                      <img src={imgUrl((posts[0] as any).featured_image_url)} alt={posts[0].title} style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: 360 }} />
                    ) : (
                      <div style={{ width: '100%', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary, #0a1f44) 100%)' }}>
                        <span style={{ fontSize: '4rem', opacity: 0.4 }}>📰</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {posts[0].is_featured && <span className="badge badge-accent" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>Featured</span>}
                    {posts[0].category && (
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                        {posts[0].category.name}
                      </p>
                    )}
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                      <Link to={`/insights/${posts[0].slug}`} style={{ color: 'inherit' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}>
                        {posts[0].title}
                      </Link>
                    </h2>
                    {posts[0].excerpt && (
                      <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{posts[0].excerpt}</p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={13} /> {posts[0].author.full_name}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={13} /> {posts[0].read_time_minutes} min read
                      </span>
                      <span>{formatDate(posts[0].published_at)}</span>
                    </div>
                    <Link to={`/insights/${posts[0].slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                      Read Article <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Grid */}
              <div className="grid grid-3">
                {posts.slice(1).map((post) => (
                  <div key={post.id} className="card" style={{ overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; }}>
                    {/* Image */}
                    <div style={{ aspectRatio: '16/10', background: 'var(--color-surface-2)', overflow: 'hidden', position: 'relative' }}>
                      {(post as any).featured_image_url ? (
                        <img src={imgUrl((post as any).featured_image_url)} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary, #0a1f44) 100%)', opacity: 0.7 }}>
                          <span style={{ fontSize: '2.5rem', opacity: 0.5 }}>📰</span>
                        </div>
                      )}
                      {post.category && (
                        <span className="badge" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'var(--color-primary)', color: '#fff', fontSize: '0.65rem' }}>
                          {post.category.name}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                          {post.excerpt.length > 100 ? post.excerpt.slice(0, 100) + '...' : post.excerpt}
                        </p>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {post.read_time_minutes} min
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Eye size={12} /> {post.views_count}
                        </span>
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                      <Link to={`/insights/${post.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', marginTop: 'auto' }}>
                        Read Article <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
