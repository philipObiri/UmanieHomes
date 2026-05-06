import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trophy, ShieldCheck, Heart, Globe, Zap, Eye, Target, TrendingUp, Briefcase } from 'lucide-react';
import { cmsApi } from '../../api';
import { useTenantStore } from '../../stores/tenantStore';
import { PageHeader } from '../../components/shared/PageHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export function About() {
  const { tenant } = useTenantStore();
  const pageRef = useScrollReveal();
  useQuery({ queryKey: ['team'], queryFn: () => cmsApi.team() });

  return (
    <div ref={pageRef} id="main-content">
      <PageHeader
        title={`About ${tenant?.name || 'Umanie Homes Africa'}`}
        subtitle={tenant?.tagline || 'Your trusted partner in premium real estate across Africa'}
        bgImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
      />

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="reveal-left">
              <h2 className="section-title">Building Africa's Real Estate Legacy</h2>
              <div className="divider-gold" style={{ margin: '0 0 var(--space-lg)' }} />
              <p>
                At {tenant?.name || 'Umanie Homes Africa'}, we believe a home is more than walls and a roof —
                it is dignity, identity, and legacy. We are entrusted with families' life savings,
                investors' trust, and dreams that span generations.
              </p>
              <p>
                That responsibility demands more than ambition. It demands integrity. We combine deep
                market knowledge with an unwavering commitment to excellence, serving clients from
                first-time buyers to seasoned investors across Africa's most prestigious locations.
              </p>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                Get in Touch
              </Link>
            </div>

            <div className="grid grid-2 reveal-right">
              {[
                { Icon: Trophy, title: 'Expert Advisory', desc: 'Guided by industry leaders and seasoned professionals' },
                { Icon: ShieldCheck, title: 'Trusted Process', desc: 'Transparent, honest dealings from inquiry to handover' },
                { Icon: Heart, title: 'Client First', desc: 'Your satisfaction and investment security are our priority' },
                { Icon: Globe, title: 'African Focus', desc: 'Deep understanding of local markets and global standards' },
              ].map((item, i) => (
                <div key={i} className="info-card" style={{ padding: '1.5rem' }}>
                  <div className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <item.Icon size={28} color="white" />
                  </div>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.8rem', margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section" style={{ background: 'var(--color-surface)' }}>
        <div className="section-header reveal">
          <h2 className="section-title">Vision &amp; Mission</h2>
          <div className="divider-gold" />
          <p className="section-subtitle">The purpose that drives every decision we make</p>
        </div>
        <div className="container">
          <div className="grid grid-2">
            {[
              {
                Icon: Eye,
                label: 'Our Vision',
                text: "To be Africa's leading and most trusted platform for real estate development and investment.",
              },
              {
                Icon: Target,
                label: 'Our Mission',
                text: 'To develop strategically positioned real estate assets across Africa with integrity, innovation, and operational excellence, providing accessible investment opportunities, creating sustainable impact, expanding home ownership, and building long-term wealth for investors and communities.',
              },
            ].map((item, i) => (
              <div key={item.label} className={`info-card reveal-scale reveal-delay-${i + 1}`}>
                <div className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <item.Icon size={28} color="white" />
                </div>
                <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>{item.label}</h3>
                <p style={{ lineHeight: 1.8, color: 'var(--color-text-secondary)', textAlign: 'center' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 5 Es — Core Values */}
      <section className="section">
        <div className="section-header reveal">
          <h2 className="section-title">The 5 Es</h2>
          <div className="divider-gold" />
          <p className="section-subtitle">Our core values — the principles that guide everything we do</p>
        </div>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                Icon: Trophy,
                title: 'Excellence',
                tagline: 'Build to global standards',
                points: [
                  'Build to global standards',
                  'Take pride in your work',
                  'Be professional, respectful and responsive',
                  'Always improve',
                  'Deliver beyond expectations',
                ],
              },
              {
                Icon: ShieldCheck,
                title: 'Ethics',
                tagline: 'Operate with integrity, always',
                points: [
                  'Operate with integrity, always',
                  'Be honest and transparent',
                  'Honor commitment',
                  'Protect client trust',
                  'Do the right thing, even when no one is watching',
                ],
              },
              {
                Icon: Zap,
                title: 'Execution',
                tagline: 'Turn plans into delivered results',
                points: [
                  'Turn plans into delivered results',
                  'Get it done — now, and very well',
                  'Finish what you start',
                  'Deliver on time',
                ],
              },
              {
                Icon: Briefcase,
                title: 'Enterprise',
                tagline: 'Own the task',
                points: [
                  'Own the task',
                  'Anticipate and solve problems early',
                  'Act immediately without waiting',
                  'Go the extra mile',
                  'Think long term',
                ],
              },
              {
                Icon: TrendingUp,
                title: 'Evolution',
                tagline: 'Improve systems and processes',
                points: [
                  'Improve systems and processes',
                  'Be innovative',
                  'Adapt quickly',
                  'Strive to be better every day',
                ],
              },
            ].map((v, i) => (
              <div key={v.title} className={`reveal-scale reveal-delay-${(i % 3) + 1}`} style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="icon" style={{ width: 44, height: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <v.Icon size={22} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Core Value</p>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>{v.title}</h3>
                  </div>
                </div>
                <div style={{ width: 32, height: 2, background: 'var(--accent-gold)', borderRadius: 2 }} />
                <ul style={{ margin: 0, padding: '0 0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {v.points.map((pt) => (
                    <li key={pt} style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section text-center">
        <div className="container">
          <h2 className="section-title text-center reveal">Ready to Start Your Journey?</h2>
          <p className="section-subtitle" style={{ margin: '0 auto 2rem' }}>Browse our listings or meet the team that will guide you.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/listings" className="btn btn-primary btn-lg">View Properties</Link>
            <Link to="/team" className="btn btn-outline btn-lg">Meet the Team</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
