import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, ExternalLink, AtSign, X, Briefcase, Award } from 'lucide-react';
import { cmsApi } from '../../api';
import { PageHeader } from '../../components/shared/PageHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import type { TeamMember } from '../../types';

const API_BASE = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';

function imgUrl(path?: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/media/')) return `${API_BASE}${path}`;
  return path; // root-relative static asset — served by Vite / frontend/public/
}

// Static photos shipped in frontend/public/team/ — keyed by name fragment
const STATIC_TEAM_PHOTOS: Record<string, string> = {
  'Sadongo':              '/team/Sadongo_New_.jpg',
  'Jacob Plange-Rhule':  '/team/Jacob_Plange_Rhule_.jpg',
  'Ronald Andrews Abbey': '/team/Ronald Andrews Abbey.jpeg',
  'John Kwesi Quarm':    '/team/John Kwesi Quarm Junior.jpeg',
};

function staticPhoto(name: string): string | null {
  for (const [fragment, path] of Object.entries(STATIC_TEAM_PHOTOS)) {
    if (name.includes(fragment)) return path;
  }
  return null;
}

function memberPhoto(member: TeamMember): string | null {
  if (member.photo_url) return imgUrl(member.photo_url);
  return staticPhoto(member.name);
}

function TeamMemberModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'confirmIn 0.25s cubic-bezier(0.16,1,0.3,1)',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem', zIndex: 1,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-primary)',
          }}
        >
          <X size={18} />
        </button>

        {/* Header: photo left + info right */}
        <div style={{
          display: 'flex', gap: '1.75rem', alignItems: 'flex-start',
          padding: '2rem 2rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        }}>
          {/* Square portrait, fixed size */}
          <div style={{
            flexShrink: 0,
            width: 160, height: 160,
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: 'var(--brand-navy)',
            border: '3px solid var(--accent-gold)',
          }}>
            {memberPhoto(member) ? (
              <img
                src={memberPhoto(member)!}
                alt={member.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                {member.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Name / title / meta */}
          <div style={{ flex: 1, minWidth: 0, paddingTop: '0.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem', lineHeight: 1.2 }}>{member.name}</h2>
            <p style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.875rem', lineHeight: 1.4 }}>{member.title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {member.years_experience && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                  <Briefcase size={13} />
                  <span>{member.years_experience}+ years experience</span>
                </div>
              )}
              {member.specialties?.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                  <Award size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{member.specialties.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.75rem 2rem' }}>
          {member.bio && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>About</h4>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, fontSize: '0.95rem' }}>{member.bio}</p>
            </div>
          )}

          {/* Contact */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {member.email && (
              <a href={`mailto:${member.email}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                <Mail size={15} /> {member.email}
              </a>
            )}
            {member.phone && (
              <a href={`tel:${member.phone}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                <Phone size={15} /> {member.phone}
              </a>
            )}
            {member.linkedin_url && (
              <a href={member.linkedin_url} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#0077B5', color: '#fff', borderRadius: 'var(--radius)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                <ExternalLink size={14} /> LinkedIn
              </a>
            )}
            {member.twitter_url && (
              <a href={member.twitter_url} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#1DA1F2', color: '#fff', borderRadius: 'var(--radius)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                <AtSign size={14} /> Twitter
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Team() {
  const { data, isLoading } = useQuery({ queryKey: ['team'], queryFn: () => cmsApi.team() });
  const team = data?.results || [];
  const pageRef = useScrollReveal();
  const [selected, setSelected] = useState<TeamMember | null>(null);

  return (
    <div ref={pageRef} id="main-content">
      <PageHeader
        title="Meet Our Team"
        subtitle="Expert professionals dedicated to finding you the perfect property"
        bgImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Team' }]}
      />

      <section className="section">
        <div className="section-header reveal">
          <h2 className="section-title">Advisory Board Members</h2>
          <div className="divider-gold" />
          <p className="section-subtitle">
            A dedicated group of real estate professionals committed to excellence and your success.
          </p>
        </div>

        <div className="container">
          {isLoading ? (
            <div className="flex-center" style={{ padding: '4rem' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="team-grid-3">
              {team.map((member, i) => (
                <div
                  key={member.id}
                  className={`card team-card reveal-scale reveal-delay-${(i % 3) + 1}`}
                  style={{ overflow: 'hidden', textAlign: 'center' }}
                >
                  <div className="card-img" style={{ height: 320, background: 'var(--border-color)', overflow: 'hidden' }}>
                    {memberPhoto(member) ? (
                      <img src={memberPhoto(member)!} alt={member.name} className="img-cover" style={{ objectPosition: 'center 15%' }} />
                    ) : (
                      <div className="flex-center" style={{ width: '100%', height: '100%', fontSize: '4rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                        {member.name?.charAt(0) ?? '?'}
                      </div>
                    )}
                  </div>

                  <div className="card-content">
                    <h3 className="team-name">{member.name}</h3>
                    <p className="team-title">{member.title}</p>

                    {member.years_experience && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        {member.years_experience}+ years experience
                      </p>
                    )}

                    {member.bio && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                        {member.bio.length > 120 ? member.bio.slice(0, 120) + '…' : member.bio}
                      </p>
                    )}

                    <div className="social-links" style={{ marginBottom: '1rem' }}>
                      {member.email && (
                        <a href={`mailto:${member.email}`} aria-label="Email"><Mail size={14} /></a>
                      )}
                      {member.phone && (
                        <a href={`tel:${member.phone}`} aria-label="Phone"><Phone size={14} /></a>
                      )}
                      {member.linkedin_url && (
                        <a href={member.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn"><ExternalLink size={14} /></a>
                      )}
                      {member.twitter_url && (
                        <a href={member.twitter_url} target="_blank" rel="noreferrer" aria-label="Twitter"><AtSign size={14} /></a>
                      )}
                    </div>

                    <button
                      onClick={() => setSelected(member)}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', background: 'transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-navy)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand-navy)'; }}
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selected && <TeamMemberModal member={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
