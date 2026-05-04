import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Upload, X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { cmsApi } from '../../api';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { toast } from '../../components/ui/Toast';

const API_BASE = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';
function imgUrl(path?: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

interface MediaItem {
  id: number;
  name: string;
  url?: string;
  file?: string;
  alt_text?: string;
  size?: number;
  file_type?: string;
}

export function GalleryPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['gallery-media'],
    queryFn: () => cmsApi.media({ file_type: 'image' }),
  });
  const images: MediaItem[] = data?.results ?? (Array.isArray(data) ? data : []);

  const deleteMut = useMutation({
    mutationFn: (id: number) => cmsApi.deleteMedia(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery-media'] });
      toast.success('Image removed from gallery.');
      if (lightboxIdx !== null && lightboxIdx >= images.length - 1) {
        setLightboxIdx(images.length > 1 ? images.length - 2 : null);
      }
    },
    onError: () => toast.error('Failed to delete image.'),
  });

  const uploadFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (!imageFiles.length) { toast.error('Only image files are allowed.'); return; }
    setUploading(true);
    let succeeded = 0;
    for (const file of imageFiles) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('name', file.name.replace(/\.[^.]+$/, ''));
      fd.append('file_type', 'image');
      try {
        await cmsApi.uploadMedia(fd);
        succeeded++;
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    if (succeeded) {
      qc.invalidateQueries({ queryKey: ['gallery-media'] });
      toast.success(`${succeeded} image${succeeded > 1 ? 's' : ''} uploaded.`);
    }
  }, [qc]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      uploadFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  };

  const prev = () => setLightboxIdx((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const next = () => setLightboxIdx((i) => (i !== null ? (i + 1) % images.length : null));

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Gallery</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {images.length} image{images.length !== 1 ? 's' : ''} — shown on the public Gallery page
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
          >
            <Upload size={16} />
            {uploading ? 'Uploading…' : 'Upload Images'}
          </button>
        </div>
      </div>

      {/* Drag-and-drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          background: dragging ? 'rgba(0,66,116,0.04)' : 'transparent',
          transition: 'all 0.2s',
          color: 'var(--color-text-muted)',
        }}
      >
        <Images size={36} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
        <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text-secondary)' }}>
          {uploading ? 'Uploading…' : 'Drop images here or click to browse'}
        </p>
        <p style={{ fontSize: '0.8rem' }}>Supports JPG, PNG, WEBP, GIF</p>
      </div>

      {/* Image grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : images.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          <Images size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>No gallery images yet. Upload some above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {images.map((img, i) => (
            <div
              key={img.id}
              style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '4/3', background: 'var(--color-surface-2)', cursor: 'pointer' }}
              onClick={() => setLightboxIdx(i)}
            >
              <img
                src={imgUrl(img.url || img.file)}
                alt={img.alt_text || img.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Overlay on hover */}
              <div
                className="gallery-overlay"
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '0.75rem' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0'; }}
              >
                <p style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.5rem', wordBreak: 'break-all' }}>
                  {img.name}
                </p>
                {img.size && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', marginBottom: '0.5rem' }}>{formatSize(img.size)}</p>}
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(img); }}
                  style={{ background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && images[lightboxIdx] && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightboxIdx(null)}
        >
          <button onClick={(e) => { e.stopPropagation(); prev(); }}
            style={{ position: 'absolute', left: '1rem', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={24} />
          </button>
          <img
            src={imgUrl(images[lightboxIdx].url || images[lightboxIdx].file)}
            alt={images[lightboxIdx].name}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 'var(--radius-lg)' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={(e) => { e.stopPropagation(); next(); }}
            style={{ position: 'absolute', right: '1rem', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={24} />
          </button>
          <button onClick={() => setLightboxIdx(null)}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
          <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{images[lightboxIdx].name}</p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{lightboxIdx + 1} / {images.length}</p>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove from Gallery"
        message={`Remove "${deleteTarget?.name}" from the gallery? This cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={() => { deleteMut.mutate(deleteTarget!.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
