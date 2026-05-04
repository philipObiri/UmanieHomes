import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trophy, ShieldCheck, Heart, Globe, Landmark, Zap, Handshake, Eye, Target } from 'lucide-react';
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
                text: 'To build developments across Africa that outlive trends, outgrow limitations, and outlast a lifetime — creating spaces that reflect Africa\'s strength, beauty, and ambition while securing generational wealth for families and investors.',
              },
              {
                Icon: Target,
                label: 'Our Mission',
                text: 'To transform real estate across Africa through unwavering integrity, excellence, and partnership — delivering premium properties that protect families\' life savings, honour investors\' trust, and fulfil dreams that span generations.',
              },
            ].map((item, i) => (
              <div key={item.label} className={`info-card reveal-scale reveal-delay-${i + 1}`} style={{ textAlign: 'left' }}>
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

      {/* Values */}
      <section className="section">
        <div className="section-header reveal">
          <h2 className="section-title">What We Stand For</h2>
          <div className="divider-gold" />
          <p className="section-subtitle">The principles that guide everything we do</p>
        </div>
        <div className="container">
          <div className="grid grid-3">
            {[
              { Icon: Landmark, title: 'Integrity', desc: 'We operate with complete transparency. Every transaction, every communication is honest and ethical.' },
              { Icon: Zap, title: 'Excellence', desc: 'We set and uphold the highest standards in property quality, service delivery, and client experience.' },
              { Icon: Handshake, title: 'Partnership', desc: "We don't just sell properties — we build lasting relationships and guide clients through their journey." },
            ].map((v, i) => (
              <div key={v.title} className={`info-card reveal-scale reveal-delay-${i + 1}`}>
                <div className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <v.Icon size={28} color="white" />
                </div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
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
