import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
 Star, ChevronLeft, ChevronRight,Building2, CircleDollarSign, TrendingUp, Key, ScanSearch, Users,
} from 'lucide-react';
import { propertiesApi, cmsApi } from '../../api';
import { PropertyCard } from '../../components/shared/PropertyCard';
import { useTenantStore } from '../../stores/tenantStore';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const API_BASE = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';

function imgUrl(path?: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

export function Home() {
  const navigate = useNavigate();
  useTenantStore();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const pageRef = useScrollReveal();

  const { data: featuredData } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: () => propertiesApi.featured(),
  });

  const { data: testimonialsData } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => cmsApi.testimonials(),
  });

  // const { data: faqsData } = useQuery({
  //   queryKey: ['faqs-home'],
  //   queryFn: () => cmsApi.faqs({ page_size: 5 }),
  // });

  const featured = featuredData?.results || [];
  const testimonials = testimonialsData?.results || [];
  // const faqs = faqsData?.results || [];
  // const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (keyword) p.set('search', keyword);
    if (location) p.set('city', location);
    if (propertyType) p.set('property_type', propertyType);
    navigate(`/listings?${p.toString()}`);
  };

  const nextTestimonial = () => setTestimonialIdx((i) => (i + 1) % testimonials.length);
  const prevTestimonial = () => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    if (!testimonials.length) return;
    const id = setInterval(nextTestimonial, 6000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  const heroImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80';

  return (
    <div ref={pageRef} id="main-content">

      {/* ===== HERO ===== */}
      <header className="hero">
        <div
          className="hero-bg"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url(${heroImage})` }}
        />
        <div className="hero-content">
          <h1>Luxury African Real Estate</h1>
          <p>Explore premium homes and high-value investment opportunities across Africa's fastest-growing locations.</p>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-field">
              <label htmlFor="hero-keyword">Search</label>
              <input
                id="hero-keyword"
                type="text"
                placeholder="e.g. 3 bedroom villa..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="hero-search-field">
              <label htmlFor="hero-city">Location</label>
              <select id="hero-city" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">All Cities</option>
                <option value="Accra">Accra, Ghana</option>
                <option value="Tema">Tema, Ghana</option>
                <option value="Lagos">Lagos, Nigeria</option>
                <option value="Nairobi">Nairobi, Kenya</option>
                <option value="Cape Town">Cape Town, South Africa</option>
              </select>
            </div>

            <div className="hero-search-field">
              <label htmlFor="hero-type">Property Type</label>
              <select id="hero-type" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                <option value="">All Types</option>
                <option value="villa">Villa</option>
                <option value="bungalow">Bungalow</option>
                <option value="duplex">Duplex</option>
                <option value="apartment">Apartment</option>
                <option value="mansion">Mansion</option>
                <option value="estate">Estate</option>
              </select>
            </div>

            <div className="hero-search-field">
              <label>Status</label>
              <select defaultValue="">
                <option value="">All Listings</option>
                <option value="available">For Sale</option>
                <option value="rented">For Rent</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">Search Now</button>
          </form>
        </div>
      </header>

      {/* ===== FEATURED PROPERTIES ===== */}
      {featured.length > 0 && (
        <section className="section">
          <div className="section-header reveal">
            <h2 className="section-title">Featured Properties</h2>
            <div className="divider-gold" />
            <p className="section-subtitle">Handpicked luxury homes in Africa's most exclusive neighborhoods</p>
          </div>
          <div className="container">
            <div className="grid grid-3">
              {featured.slice(0, 3).map((p, i) => (
                <div key={p.id} className={`reveal-scale reveal-delay-${i + 1}`}>
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>
            <div className="text-center reveal" style={{ marginTop: 50 }}>
              <Link to="/listings" className="btn btn-outline btn-lg">View All Properties</Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== SERVICES ===== */}
      <section className="section">
        <div className="section-header reveal">
          <h2 className="section-title">Our Services</h2>
          <div className="divider-gold" />
          <p className="section-subtitle">Comprehensive real estate solutions tailored to your luxury lifestyle</p>
        </div>
        <div className="container">
          <div className="grid grid-3">
            {[
              { Icon: Building2, title: 'Buy Property', desc: "Find your dream home from our curated selection of luxury properties across Africa's finest locations." },
              { Icon: CircleDollarSign, title: 'Sell Property', desc: 'Get maximum value for your property with our expert marketing and extensive buyer network.' },
              { Icon: TrendingUp, title: 'Invest Wisely', desc: 'Strategic investment advice to build and manage your luxury real estate portfolio.' },
              { Icon: Key, title: 'Property Management', desc: 'Comprehensive management services ensuring your investment remains in pristine condition.' },
              { Icon: ScanSearch, title: 'Property Valuation', desc: 'Professional appraisal services to determine accurate market value for your luxury assets.' },
              { Icon: Users, title: 'Consultation', desc: 'Expert guidance on market trends, legal requirements, and investment opportunities across Africa.' },
            ].map((svc, i) => (
              <div key={svc.title} className={`info-card reveal-scale reveal-delay-${i + 1}`}>
                <div className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svc.Icon size={32} color="white" />
                </div>
                <h3>{svc.title}</h3>
                <p>{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ===== FOUNDER'S MESSAGE ===== */}
      <section className="section" style={{ background: 'var(--color-surface)', padding: '80px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)',
            gap: '4rem',
            alignItems: 'center',
          }}
            className="founder-grid"
          >
            {/* Photo */}
            <div className="reveal-left" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{
                  width: 300, height: 380,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '4px solid var(--accent-gold)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                }}>
                  <img
                    src="/team/Emmanual_Solomon.jpeg"
                    alt="Emmanuel U. Solomon"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
                  />
                </div>
                {/* Gold accent bar */}
                <div style={{
                  position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--accent-gold)', color: '#fff',
                  padding: '0.5rem 1.5rem', borderRadius: '999px',
                  fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', whiteSpace: 'nowrap',
                }}>
                  Founder & CEO
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="reveal-right">
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                A Message from the Founder
              </p>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.25rem', lineHeight: 1.25 }}>
                The Founder's Oath
              </h2>
              <div className="divider-gold" style={{ margin: '0 0 1.75rem' }} />

              {/* Opening quote mark */}
              <div style={{ fontSize: '5rem', lineHeight: 0.6, color: 'var(--accent-gold)', opacity: 0.4, fontFamily: 'Georgia, serif', marginBottom: '1rem', userSelect: 'none' }}>"</div>

              <blockquote style={{
                fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--color-text-secondary)',
                fontStyle: 'italic', margin: '0 0 1.5rem',
                borderLeft: '3px solid var(--accent-gold)',
                paddingLeft: '1.25rem',
              }}>
                I believe Africa deserves developments that reflect her strength, beauty, and ambition.
                I believe property ownership should not just provide shelter, but create generational wealth.
                <br /><br />
                Growth must never outpace integrity. We will never promise what we cannot deliver,
                we will never pursue profit at the expense of trust.
                <br /><br />
                Through Umanie Homes Africa, I commit to building spaces that outlive trends,
                outgrow limitations, and outlast my lifetime.
              </blockquote>

              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)', margin: 0 }}>Emmanuel U. Solomon</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', margin: '0.25rem 0 0', fontWeight: 600 }}>Chief Executive Officer, Umanie Homes Africa</p>
              </div>

              <Link to="/about" className="btn btn-primary">
                Learn Our Story →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {testimonials.length > 0 && (
        <section className="section" style={{ background: 'var(--card-bg)' }}>
          <div className="section-header reveal">
            <h2 className="section-title">Client Testimonials</h2>
            <div className="divider-gold" />
            <p className="section-subtitle">Hear from our satisfied clients across the continent</p>
          </div>
          <div className="container">
            <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
              {testimonials[testimonialIdx] && (
                <div key={testimonialIdx} className="fade-in">
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: '1.5rem' }}>
                    {Array.from({ length: testimonials[testimonialIdx].rating || 5 }).map((_, i) => (
                      <Star key={i} size={20} fill="var(--accent-gold)" color="var(--accent-gold)" />
                    ))}
                  </div>
                  <blockquote style={{ fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: '2rem', fontStyle: 'italic' }}>
                    "{testimonials[testimonialIdx].quote}"
                  </blockquote>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    {testimonials[testimonialIdx].photo_url ? (
                      <img src={imgUrl(testimonials[testimonialIdx].photo_url)} alt={testimonials[testimonialIdx].name}
                        style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid var(--accent-gold)', objectFit: 'cover' }} />
                    ) : (
                      <div className="flex-center" style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-gold)', fontWeight: 700, color: '#fff', fontSize: '1.25rem' }}>
                        {testimonials[testimonialIdx].name?.charAt(0) ?? '?'}
                      </div>
                    )}
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{testimonials[testimonialIdx].name}</p>
                      {testimonials[testimonialIdx].title && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{testimonials[testimonialIdx].title}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {testimonials.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem', alignItems: 'center' }}>
                  <button onClick={prevTestimonial} style={{ background: 'var(--border-color)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={20} />
                  </button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {testimonials.map((_, i) => (
                      <button key={i} onClick={() => setTestimonialIdx(i)}
                        style={{ width: i === testimonialIdx ? 24 : 8, height: 8, borderRadius: 4, background: i === testimonialIdx ? 'var(--accent-gold)' : 'var(--border-color)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
                    ))}
                  </div>
                  <button onClick={nextTestimonial} style={{ background: 'var(--border-color)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== NEWSLETTER ===== */}
      <section className="section" style={{ padding: '60px 7%' }}>
        <div className="container text-center">
          <h2 style={{ fontSize: '2rem', marginBottom: 15 }}>Stay Updated</h2>
          <p style={{ maxWidth: 600, margin: '0 auto 30px' }}>
            Subscribe to our newsletter for exclusive property listings, market insights, and luxury real estate trends.
          </p>
          <form style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}
            onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address" required
              style={{ flex: 1, minWidth: 240, padding: '14px 20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontFamily: 'inherit', fontSize: '1rem', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }} />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </section>

    </div>
  );
}
