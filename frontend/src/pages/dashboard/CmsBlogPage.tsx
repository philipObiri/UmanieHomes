import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Eye, Trash2 } from 'lucide-react';
import { cmsApi } from '../../api';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RichTextEditor } from '../../components/shared/RichTextEditor';
import { toast } from '../../components/ui/Toast';
import type { BlogPost } from '../../types';

const API_BASE = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';

function BlogForm({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<BlogPost> | null;
  onSave: (data: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    excerpt: initial?.excerpt ?? '',
    content: initial?.content ?? { type: 'doc', content: [] },
    is_published: initial?.is_published ?? false,
    is_featured: initial?.is_featured ?? false,
    read_time_minutes: initial?.read_time_minutes ?? 5,
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Title *</label>
          <input
            value={form.title}
            onChange={(e) => { set('title', e.target.value); set('slug', autoSlug(e.target.value)); }}
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

      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Excerpt</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => set('excerpt', e.target.value)}
          rows={2}
          placeholder="Short summary shown in listing views…"
          style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>

      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Content</label>
        <RichTextEditor
          content={form.content as object}
          onChange={(json) => set('content', json)}
          placeholder="Write your blog post here…"
          minHeight={300}
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text)' }}>
          <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} />
          Published
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text)' }}>
          <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} />
          Featured
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
          <label>Read time (min):</label>
          <input
            type="number"
            value={form.read_time_minutes}
            onChange={(e) => set('read_time_minutes', parseInt(e.target.value))}
            min={1}
            style={{ width: 60, padding: '0.3rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
        <button onClick={onClose} style={{ padding: '0.625rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text)' }}>Cancel</button>
        <button
          onClick={() => onSave(form)}
          style={{ padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}
        >
          {initial ? 'Save Changes' : 'Publish Post'}
        </button>
      </div>
    </div>
  );
}

export function CmsBlogPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['blog-posts-admin'],
    queryFn: () => cmsApi.posts(),
  });

  const posts: BlogPost[] = data?.results ?? [];

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing
        ? cmsApi.updatePost(editing.slug, payload)
        : cmsApi.createPost(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts-admin'] });
      setModalOpen(false);
      toast.success(editing ? 'Post updated.' : 'Post published.');
    },
    onError: () => toast.error('Failed to save post.'),
  });

  const deleteMut = useMutation({
    mutationFn: (slug: string) => cmsApi.deletePost(slug),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blog-posts-admin'] }); toast.success('Post deleted.'); },
    onError: () => toast.error('Failed to delete post.'),
  });

  const formatDate = (str: string) => new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Blog Posts</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{posts.length} posts</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={16} /> New Post
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
                  {['Post', 'Category', 'Author', 'Views', 'Published', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-surface)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {post.featured_image && (
                          <div style={{ width: 48, height: 36, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, background: 'var(--color-surface-2)' }}>
                            <img src={post.featured_image.startsWith('http') ? post.featured_image : `${API_BASE}${post.featured_image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>{post.title}</p>
                          {post.is_featured && <span className="badge badge-accent" style={{ fontSize: '0.6rem' }}>Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{post.category?.name || '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{post.author?.full_name}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{post.views_count}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(post.published_at)}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <a href={`/insights/${post.slug}`} target="_blank" rel="noreferrer"
                          style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                          <Eye size={14} />
                        </a>
                        <button onClick={() => { setEditing(post); setModalOpen(true); }}
                          style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteSlug(post.slug)}
                          style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-error)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No posts yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Post' : 'New Blog Post'} size="lg">
        <BlogForm
          initial={editing}
          onSave={(data) => save.mutate(data)}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteSlug !== null}
        title="Delete Post"
        message="This will permanently delete the blog post. This action cannot be undone."
        confirmLabel="Delete Post"
        onConfirm={() => { deleteMut.mutate(deleteSlug!); setDeleteSlug(null); }}
        onCancel={() => setDeleteSlug(null)}
      />
    </div>
  );
}
