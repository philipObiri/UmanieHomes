import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Eye, Globe, Trash2 } from 'lucide-react';
import { cmsApi } from '../../api';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RichTextEditor } from '../../components/shared/RichTextEditor';
import { toast } from '../../components/ui/Toast';

interface Page {
  id: number;
  title: string;
  slug: string;
  page_type: string;
  is_published: boolean;
  content?: object;
  meta_title?: string;
  meta_description?: string;
  updated_at: string;
}

const PAGE_TYPES = ['home', 'about', 'contact', 'team', 'gallery', 'custom'];

function PageForm({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<Page> | null;
  onSave: (data: Partial<Page>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Page>>({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    page_type: initial?.page_type ?? 'custom',
    is_published: initial?.is_published ?? false,
    content: initial?.content ?? { type: 'doc', content: [] },
    meta_title: initial?.meta_title ?? '',
    meta_description: initial?.meta_description ?? '',
  });

  const set = (k: keyof Page, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>
            Page Title *
          </label>
          <input
            value={form.title}
            onChange={(e) => { set('title', e.target.value); if (!initial) set('slug', autoSlug(e.target.value)); }}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Slug</label>
          <input
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Page Type</label>
          <select
            value={form.page_type}
            onChange={(e) => set('page_type', e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          >
            {PAGE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text)' }}>
            <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} />
            Published
          </label>
        </div>
      </div>

      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Content</label>
        <RichTextEditor
          content={form.content as object}
          onChange={(json) => set('content', json)}
          placeholder="Write your page content here…"
          minHeight={280}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Meta Title</label>
          <input
            value={form.meta_title}
            onChange={(e) => set('meta_title', e.target.value)}
            placeholder="SEO page title…"
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Meta Description</label>
          <input
            value={form.meta_description}
            onChange={(e) => set('meta_description', e.target.value)}
            placeholder="SEO description…"
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
        <button onClick={onClose} style={{ padding: '0.625rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text)' }}>
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          style={{ padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}
        >
          {initial ? 'Save Changes' : 'Create Page'}
        </button>
      </div>
    </div>
  );
}

export function CmsPagesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Page | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['cms-pages'],
    queryFn: () => cmsApi.pages(),
  });

  const pages: Page[] = Array.isArray(data) ? data : (data?.results ?? []);

  const save = useMutation({
    mutationFn: (payload: Partial<Page>) =>
      editing
        ? cmsApi.updatePage(editing.slug, payload)
        : cmsApi.createPage(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cms-pages'] });
      setModalOpen(false);
      toast.success(editing ? 'Page updated.' : 'Page created.');
    },
    onError: () => toast.error('Failed to save page.'),
  });

  const deleteMut = useMutation({
    mutationFn: (slug: string) => cmsApi.deletePage(slug),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms-pages'] }); toast.success('Page deleted.'); },
    onError: () => toast.error('Failed to delete page.'),
  });

  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>CMS Pages</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {pages.length} page{pages.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={16} /> New Page
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
                  {['Title', 'Type', 'Status', 'Last Updated', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-surface)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>{page.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>/{page.slug}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className="badge badge-muted" style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>{page.page_type}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className="badge" style={{ fontSize: '0.65rem', background: page.is_published ? 'var(--color-success)' : 'var(--color-surface-2)', color: page.is_published ? '#fff' : 'var(--color-text-secondary)' }}>
                        {page.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {page.updated_at ? formatDate(page.updated_at) : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <a href={`/${page.slug}`} target="_blank" rel="noreferrer"
                          style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                          <Eye size={14} />
                        </a>
                        <button
                          onClick={() => { setEditing(page); setModalOpen(true); }}
                          style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(page)}
                          style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-error)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pages.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                      <Globe size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                      <p>No pages yet. Create your first page.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit: ${editing.title}` : 'New Page'}
        size="lg"
      >
        <PageForm
          initial={editing}
          onSave={(data) => save.mutate(data)}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Page"
        message={`"${deleteTarget?.title}" will be permanently deleted.`}
        confirmLabel="Delete Page"
        onConfirm={() => { deleteMut.mutate(deleteTarget!.slug); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
