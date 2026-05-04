import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Image, FileText, Video } from 'lucide-react';
import { cmsApi } from '../../api';
import { toast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const API_BASE = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';
function imgUrl(path?: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  image: Image,
  doc: FileText,
  video: Video,
};

export function CmsMediaPage() {
  const qc = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['media', filter],
    queryFn: () => cmsApi.media(filter ? { file_type: filter } : undefined),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => cmsApi.deleteMedia(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media'] }); toast.success('File deleted.'); },
    onError: () => toast.error('Failed to delete file.'),
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('name', file.name);
        await cmsApi.uploadMedia(fd);
      }
      qc.invalidateQueries({ queryKey: ['media'] });
      toast.success(`${files.length} file(s) uploaded.`);
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  }, []);

  const media = data?.results || [];

  const formatBytes = (bytes: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Media Library</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{data?.count || 0} files</p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}>
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload Files'}
          <input type="file" multiple onChange={(e) => handleUpload(e.target.files)} style={{ display: 'none' }} accept="image/*,video/*,.pdf,.doc,.docx" />
        </label>
      </div>

      {/* Drag drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center',
          marginBottom: '1.5rem', background: isDragging ? 'rgba(0,66,116,0.04)' : 'var(--color-surface)',
          transition: 'all 0.2s',
          color: 'var(--color-text-muted)', fontSize: '0.875rem',
        }}
      >
        <Upload size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
        Drop files here to upload
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem' }}>
        {[{ key: '', label: 'All' }, { key: 'image', label: 'Images' }, { key: 'doc', label: 'Documents' }, { key: 'video', label: 'Videos' }].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ padding: '0.375rem 1rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: filter === key ? 'var(--color-primary)' : 'var(--color-surface)', color: filter === key ? '#fff' : 'var(--color-text-secondary)', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {media.map((file: any) => {
            const TypeIcon = TYPE_ICONS[file.file_type] || FileText;
            return (
              <div key={file.id} className="card" style={{ overflow: 'hidden', position: 'relative', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
                  (e.currentTarget.querySelector('.del-btn') as HTMLElement | null)!.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'none';
                  (e.currentTarget.querySelector('.del-btn') as HTMLElement | null)!.style.opacity = '0';
                }}>
                {/* Preview */}
                <div style={{ aspectRatio: '1', background: 'var(--color-surface-2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {file.file_type === 'image' && file.url ? (
                    <img src={imgUrl(file.url)} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <TypeIcon size={36} color="var(--color-text-muted)" />
                  )}
                </div>
                <div style={{ padding: '0.625rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{formatBytes(file.size)}</p>
                </div>
                {/* Delete overlay */}
                <button
                  className="del-btn"
                  onClick={() => setDeleteTarget({ id: file.id, name: file.name })}
                  style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    opacity: 0, transition: 'opacity 0.2s',
                    background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '50%',
                    width: 28, height: 28, cursor: 'pointer', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
          {media.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
              No files yet. Upload some!
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete File"
        message={`"${deleteTarget?.name}" will be permanently deleted from the media library.`}
        confirmLabel="Delete File"
        onConfirm={() => { deleteMut.mutate(deleteTarget!.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
