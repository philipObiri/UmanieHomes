import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Eye, User, ArrowLeft, Tag as TagIcon } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cmsApi } from '../../api';
import { PageHeader } from '../../components/shared/PageHeader';

const API_BASE = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';
function imgUrl(path?: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function BlogContent({ content }: { content: object }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false,
  });

  return (
    <div className="blog-content">
      <EditorContent editor={editor} />
    </div>
  );
}

export function InsightDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => cmsApi.post(slug!),
    enabled: !!slug,
  });

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
    </div>
  );

  if (isError || !post) return (
    <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--color-text-muted)' }}>
      <h2>Article not found</h2>
      <Link to="/insights" style={{ color: 'var(--color-primary)', marginTop: '1rem', display: 'inline-block' }}>
        Back to Insights
      </Link>
    </div>
  );

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <PageHeader
        title={post.title}
        subtitle={post.excerpt}
        bgImage={post.featured_image ? imgUrl(post.featured_image) : 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1920&q=80'}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Insights', to: '/insights' },
          { label: post.title },
        ]}
      />

      <div className="container" style={{ maxWidth: 860, paddingTop: '3rem' }}>

        {/* Back link */}
        <Link to="/insights" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back to Insights
        </Link>

        {/* Meta bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <User size={14} /> {post.author.full_name}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={14} /> {post.read_time_minutes} min read
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Eye size={14} /> {post.views_count} views
          </span>
          <span>{formatDate(post.published_at)}</span>
          {post.category && (
            <span style={{ background: 'var(--color-primary)', color: '#fff', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
              {post.category.name}
            </span>
          )}
        </div>

        {/* Featured image (shown again at full width inside article) */}
        {post.featured_image && (
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '2.5rem', aspectRatio: '16/7' }}>
            <img
              src={imgUrl(post.featured_image)}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Article body */}
        <article>
          {post.content
            ? <BlogContent content={post.content as object} />
            : <p style={{ color: 'var(--color-text-secondary)' }}>No content available.</p>
          }
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <TagIcon size={14} color="var(--color-text-muted)" />
            {post.tags.map((tag) => (
              <span key={tag.id} style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem' }}>
                {tag.name}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
