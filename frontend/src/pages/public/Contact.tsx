import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, ChevronDown } from 'lucide-react';
import { api } from '../../api/client';
import { toast } from '../../components/ui/Toast';
import { useTenantStore } from '../../stores/tenantStore';
import { PageHeader } from '../../components/shared/PageHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const FAQS = [
  { category: 'Buying', question: 'What is the typical process for buying a luxury property with Umanie Homes?', answer: 'Our buying process begins with an initial consultation to understand your needs and budget. We then curate a selection of properties matching your criteria, arrange viewings, assist with negotiations, coordinate due diligence and legal reviews, and guide you through to closing.' },
  { category: 'Buying', question: 'Can foreigners buy property in African countries?', answer: 'Property ownership laws vary by country. In Ghana, Kenya, and Tanzania, foreigners can own property but may face restrictions on land ownership (leasehold vs. freehold). In Nigeria, foreign nationals can own property in most states. Our team provides detailed guidance on regulations specific to each country.' },
  { category: 'Buying', question: 'What are the typical closing costs and fees?', answer: 'Closing costs typically include legal fees (1-2% of property value), registration fees, stamp duty (varies by country, typically 1-5%), and survey costs. In Ghana, expect 2-3% in total costs. We provide a detailed breakdown during the offer stage so there are no surprises.' },
  { category: 'Financing', question: 'Do you assist with mortgage financing?', answer: 'Yes, we work with leading banks and financial institutions across Africa that offer mortgage products for luxury properties. We can connect you with mortgage advisors who specialise in high-value property financing. Interest rates typically range from 12-18% in most markets.' },
  { category: 'Financing', question: 'What is the typical down payment required?', answer: 'For luxury properties, most lenders require a down payment of 30-40% of the property value. Some banks may require up to 50% for non-resident buyers. Cash purchases are common in the luxury segment.' },
  { category: 'Selling', question: 'How do you determine the listing price for my property?', answer: 'We conduct a comprehensive market analysis comparing your property to recent sales of similar properties in your area, considering location, size, features, condition, and current market trends. Our goal is to price competitively while maximising your return.' },
  { category: 'Selling', question: 'What is your commission structure?', answer: 'Our standard commission for selling luxury properties is 5% of the sale price, typically paid by the seller at closing. This covers professional photography, marketing, listing on major platforms, viewings, negotiations, and transaction management.' },
  { category: 'Investment', question: 'What are typical rental yields for luxury properties?', answer: 'Rental yields vary by location. In Accra and Lagos, luxury properties typically yield 4-6% annually. Nairobi and Kampala see yields of 5-7%. Cape Town ranges from 5-8%. Our investment advisors can provide detailed projections for specific properties.' },
  { category: 'Investment', question: 'Which African cities offer the best investment opportunities?', answer: 'Several cities show strong potential: Accra and Lagos for West Africa\'s growing economy, Nairobi and Kigali for East Africa\'s stability, and Cape Town for international appeal. We recommend diversifying and choosing markets aligned with your goals and risk tolerance.' },
  { category: 'Legal', question: 'What due diligence is conducted on properties?', answer: 'We conduct thorough due diligence including title verification, property survey confirmation, outstanding debt check, planning permission verification, review of property tax records, and structural inspection. We engage qualified surveyors and lawyers to ensure a safe investment.' },
  { category: 'General', question: 'Can you arrange virtual viewings for international clients?', answer: 'Absolutely! We offer comprehensive virtual tours including live video walkthroughs, 360-degree photography, detailed video presentations, and one-on-one video consultations. Many international clients complete purchases sight-unseen with full confidence.' },
  { category: 'General', question: 'What makes Umanie Homes different from other real estate agencies?', answer: 'We specialise exclusively in luxury properties across Africa, bringing unmatched regional expertise. Our agents are carefully selected for their market knowledge and professionalism. We offer personalised service, leveraging technology for efficiency while maintaining the human touch.' },
];

const CATEGORIES = ['All', ...Array.from(new Set(FAQS.map(f => f.category)))];

export function Contact() {
  const { tenant } = useTenantStore();
  const pageRef = useScrollReveal();
  const [faqCategory, setFaqCategory] = useState('All');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '', property_type: '',
  });

  const submit = useMutation({
    mutationFn: (data: typeof form) => api.post('/crm/leads/', { ...data, source: 'website' }),
    onSuccess: () => {
      toast.success('Message sent! We\'ll respond within 24 hours.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '', property_type: '' });
    },
    onError: () => toast.error('Failed to send. Please try again or call us directly.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit.mutate(form);
  };

  const contactItems = [
    { icon: Phone, label: 'Phone', value: tenant?.contact_phone || '+233 54 969 5146', href: `tel:${tenant?.contact_phone || '+233549695146'}` },
    { icon: Mail, label: 'Email', value: tenant?.contact_email || 'info@umaniehomesafrica.com', href: `mailto:${tenant?.contact_email}` },
    { icon: MapPin, label: 'Address', value: tenant?.address ? `${tenant.address}${tenant.city ? `, ${tenant.city}` : ''}` : 'Main Street Lashibi off Chicken Man Pizzaman, Tema, Ghana', href: null },
    { icon: Clock, label: 'Hours', value: tenant?.business_hours || 'Mon–Fri: 7AM–7PM', href: null },
  ];

  return (
    <div ref={pageRef} id="main-content">
      <PageHeader
        title="Contact Us"
        subtitle="Have a question about a property? Looking to list? We're here to help."
        bgImage="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact info */}
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>Get in Touch</h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
                Our team is ready to help you find your perfect property or answer any questions you may have.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {contactItems.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(0,66,116,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color="var(--color-primary)" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{label}</p>
                      {href ? (
                        <a href={href} style={{ color: 'var(--color-text)', fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}>
                          {value}
                        </a>
                      ) : (
                        <p style={{ color: 'var(--color-text)', fontWeight: 500, fontSize: '0.95rem' }}>{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <div style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <MessageCircle size={28} color="#fff" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>Chat on WhatsApp</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Quick responses during business hours</p>
                </div>
                <a
                  href={`https://wa.me/${(tenant?.contact_phone || '+233549695146').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ padding: '0.5rem 1rem', background: '#fff', color: '#128c7e', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.875rem' }}
                >
                  Chat
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1.5rem' }}>Send Us a Message</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-row-2">
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Full Name *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Kofi Mensah"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Email *</label>
                    <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none' }} />
                  </div>
                </div>
                <div className="form-row-2">
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+233 ..."
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>I'm interested in</label>
                    <select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none' }}>
                      <option value="">Select...</option>
                      {['Buying', 'Renting', 'Investing', 'Listing my property', 'General Inquiry'].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Subject</label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="What can we help you with?"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Message *</label>
                  <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us more about what you're looking for..."
                    rows={5}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none', resize: 'vertical' }} />
                </div>
                <button
                  type="submit"
                  disabled={submit.isPending}
                  style={{
                    padding: '1rem', background: 'var(--color-primary)', color: '#fff',
                    border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700,
                    fontSize: '1rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    opacity: submit.isPending ? 0.7 : 1,
                  }}
                >
                  {submit.isPending ? (
                    <><span className="spinner" style={{ width: 18, height: 18 }} /> Sending...</>
                  ) : (
                    <><Send size={18} /> Send Message</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section" style={{ background: 'var(--card-bg)' }}>
        <div className="section-header reveal">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="divider-gold" />
          <p className="section-subtitle">Find answers to common questions about our services</p>
        </div>
        <div className="container" style={{ maxWidth: 860, marginLeft: 'auto', marginRight: 'auto' }}>
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setFaqCategory(cat); setOpenFaq(null); }}
                style={{
                  padding: '0.4rem 1.1rem', borderRadius: '999px', border: '1px solid',
                  borderColor: faqCategory === cat ? 'var(--accent-gold)' : 'var(--border-color)',
                  background: faqCategory === cat ? 'var(--accent-gold)' : 'transparent',
                  color: faqCategory === cat ? '#fff' : 'var(--text-secondary)',
                  fontWeight: faqCategory === cat ? 700 : 400,
                  fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >{cat}</button>
            ))}
          </div>

          {/* Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQS.filter(f => faqCategory === 'All' || f.category === faqCategory).map((faq, i) => (
              <div
                key={i}
                style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', gap: '1rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.4 }}>
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    color="var(--accent-gold)"
                    style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
                  />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 1.25rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
