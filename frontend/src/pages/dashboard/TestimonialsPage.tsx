import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { cmsApi } from '../../api';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { toast } from '../../components/ui/Toast';
import type { Testimonial } from '../../types';

const EMPTY: Partial<Testimonial> = {
  name: '', title: '', quote: '', rating: 5, location: '', is_featured: true, order: 0,
};

function TestimonialForm({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<Testimonial> | null;
  onSave: (fd: FormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    title: initial?.title ?? '',
    quote: initial?.quote ?? '',
    rating: initial?.rating ?? 5,
    location: initial?.location ?? '',
    is_featured: initial?.is_featured ?? true,
    order: initial?.order ?? 0,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.quote.trim()) {
      toast.error('Name and quote are required.');
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (photo) fd.append('photo', photo);
    onSave(fd);
  };

  const inputStyle = {
    width: '100%', padding: '0.5rem 0.75rem',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg)', color: 'var(--color-text)',
    boxSizing: 'border-box' as const, fontFamily: 'inherit',
  };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Client Name *</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} style={inputStyle} placeholder="e.g. Kwame Asante" />
        </div>
        <div>
          <label style={labelStyle}>Title / Role</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} style={inputStyle} placeholder="e.g. CEO, Accra Holdings" />
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input value={form.location} onChange={(e) => set('location', e.target.value)} style={inputStyle} placeholder="e.g. Accra, Ghana" />
        </div>
        <div>
          <label style={labelStyle}>Rating (1–5)</label>
          <div style={{ display: 'flex', gap: 6, paddingTop: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => set('rating', n)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Star size={22} fill={n <= form.rating ? '#C9A974' : 'none'} color={n <= form.rating ? '#C9A974' : '#ccc'} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Testimonial *</label>
        <textarea value={form.quote} onChange={(e) => set('quote', e.target.value)} rows={4}
          placeholder="What the client said…"
          style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      <div>
        <label style={labelStyle}>Client Photo</label>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button type="button" onClick={() => fileRef.current?.click()}
            style={{ padding: '0.5rem 1rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            {photo ? photo.name : 'Choose photo…'}
          </button>
          {photo && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{(photo.size / 1024).toFixed(0)} KB</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text)' }}>
          <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} />
          Featured on homepage
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
          <label>Display order:</label>
          <input type="number" value={form.order} onChange={(e) => set('order', parseInt(e.target.value) || 0)} min={0}
            style={{ width: 60, padding: '0.3rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
        <button onClick={onClose} style={{ padding: '0.625rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text)' }}>Cancel</button>
        <button onClick={handleSubmit}
          style={{ padding: '0.625rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}>
          {initial?.id ? 'Save Changes' : 'Add Testimonial'}
        </button>
      </div>
    </div>
  );
}

export function TestimonialsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: () => cmsApi.testimonials(),
  });
  const testimonials: Testimonial[] = data?.results ?? (Array.isArray(data) ? data as Testimonial[] : []);

  const saveMut = useMutation({
    mutationFn: (fd: FormData) =>
      editing?.id ? cmsApi.updateTestimonial(editing.id, fd) : cmsApi.createTestimonial(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-testimonials'] });
      toast.success(editing?.id ? 'Testimonial updated.' : 'Testimonial added.');
      setModal(false);
    },
    onError: () => toast.error('Failed to save testimonial.'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => cmsApi.deleteTestimonial(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-testimonials'] }); toast.success('Deleted.'); },
    onError: () => toast.error('Failed to delete testimonial.'),
  });

  const openCreate = () => { setEditing(EMPTY); setModal(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setModal(true); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Testimonials</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{testimonials.length} reviews</p>
        </div>
        <button onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                  {['Client', 'Quote', 'Rating', 'Location', 'Featured', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {testimonials.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-surface)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        {t.photo_url ? (
                          <img src={t.photo_url} alt={t.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                            {t.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>{t.name}</p>
                          {t.title && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t.title}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: 300 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        "{t.quote}"
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="#C9A974" color="#C9A974" />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{t.location || '—'}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className="badge" style={{ background: t.is_featured ? 'var(--color-success)' : 'var(--color-surface-2)', color: t.is_featured ? '#fff' : 'var(--color-text-muted)', fontSize: '0.65rem' }}>
                        {t.is_featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button onClick={() => openEdit(t)}
                          style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(t)}
                          style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-error)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {testimonials.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No testimonials yet. Add one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing?.id ? 'Edit Testimonial' : 'Add Testimonial'} size="lg">
        <TestimonialForm
          initial={editing}
          onSave={(fd) => saveMut.mutate(fd)}
          onClose={() => setModal(false)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Testimonial"
        message={`Remove testimonial from "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => { deleteMut.mutate(deleteTarget!.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
