import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, Search, Star, X, ImagePlus } from 'lucide-react';
import { propertiesApi } from '../../api';
import { toast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Property } from '../../types';

const API_BASE = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';
function imgUrl(path?: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

const EMPTY: Partial<Property> = {
  title: '', description: '', property_type: 'bungalow', listing_type: 'sale',
  status: 'available', price: '0', currency: 'USD', bedrooms: 3, bathrooms: 2,
  sqft: 0, address: '', city: '', country: 'Ghana', is_featured: false,
};

export function PropertiesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [modalTab, setModalTab] = useState<'details' | 'images'>('details');
  const [editing, setEditing] = useState<Partial<Property>>(EMPTY);
  const [page] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-properties', search, page],
    queryFn: () => propertiesApi.list({ search, page }),
  });

  const createMut = useMutation({
    mutationFn: (data: Partial<Property>) => propertiesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-properties'] }); toast.success('Property created.'); setModal(null); },
    onError: () => toast.error('Failed to create property.'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Property> }) => propertiesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-properties'] }); toast.success('Property updated.'); setModal(null); },
    onError: () => toast.error('Failed to update property.'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => propertiesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-properties'] }); toast.success('Property deleted.'); },
    onError: () => toast.error('Failed to delete property.'),
  });

  const { data: imagesData, isLoading: imagesLoading } = useQuery({
    queryKey: ['property-images', editing.id],
    queryFn: () => propertiesApi.listImages(editing.id!),
    enabled: !!editing.id,
  });
  const images: Array<{ id: number; image: string; is_primary: boolean }> = imagesData?.results || imagesData || [];

  const uploadImageMut = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => {
      const fd = new FormData();
      fd.append('image', file);
      return propertiesApi.uploadImage(id, fd);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['property-images', editing.id] }); qc.invalidateQueries({ queryKey: ['admin-properties'] }); },
    onError: () => toast.error('Upload failed.'),
  });

  const deleteImageMut = useMutation({
    mutationFn: ({ propertyId, imageId }: { propertyId: number; imageId: number }) => propertiesApi.deleteImage(propertyId, imageId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['property-images', editing.id] }); qc.invalidateQueries({ queryKey: ['admin-properties'] }); },
    onError: () => toast.error('Failed to delete image.'),
  });

  const setPrimaryMut = useMutation({
    mutationFn: ({ propertyId, imageId }: { propertyId: number; imageId: number }) => propertiesApi.setPrimaryImage(propertyId, imageId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['property-images', editing.id] }); qc.invalidateQueries({ queryKey: ['admin-properties'] }); },
    onError: () => toast.error('Failed to set primary.'),
  });

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || !editing.id) return;
    Array.from(files).forEach((file) => uploadImageMut.mutate({ id: editing.id!, file }));
  };

  const handleSave = () => {
    if (editing.id) updateMut.mutate({ id: editing.id, data: editing });
    else createMut.mutate(editing);
  };

  const openEdit = (p: Property) => {
    setEditing(p);
    setModalTab('details');
    setModal('edit');
  };

  const openCreate = () => {
    setEditing(EMPTY);
    setModalTab('details');
    setModal('create');
  };

  const properties = data?.results || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Properties</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{data?.count || 0} total listings</p>
        </div>
        <button
          onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={16} /> Add Property
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search properties..."
          style={{ width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }} />
      </div>

      {/* Table */}
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
                  {['Property', 'Type', 'Status', 'Price', 'Beds/Baths', 'City', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-surface)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 48, height: 36, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--color-surface-2)', flexShrink: 0 }}>
                          {p.primary_image ? <img src={imgUrl(p.primary_image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏠</div>}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>{p.title}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{p.reference_id}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      {p.property_type_display}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className="badge" style={{ fontSize: '0.65rem', background: p.status === 'available' ? 'var(--color-success)' : 'var(--color-surface-2)', color: p.status === 'available' ? '#fff' : 'var(--color-text-secondary)' }}>
                        {p.status_display}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      {p.currency} {parseFloat(p.price).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      {p.bedrooms}bd / {p.bathrooms}ba
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      {p.city}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <a href={`/listings/${p.slug || p.id}`} target="_blank" rel="noreferrer"
                          style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                          <Eye size={14} />
                        </a>
                        <button onClick={() => openEdit(p)}
                          style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-error)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {properties.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No properties found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Property' : 'Edit Property'} size="lg">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)', marginBottom: '1.25rem' }}>
          {(['details', 'images'] as const).map((tab) => (
            <button key={tab} onClick={() => setModalTab(tab)}
              style={{ padding: '0.5rem 1.25rem', border: 'none', borderBottom: tab === modalTab ? '2px solid var(--color-primary)' : '2px solid transparent', background: 'transparent', cursor: 'pointer', fontWeight: tab === modalTab ? 700 : 400, color: tab === modalTab ? 'var(--color-primary)' : 'var(--color-text-muted)', textTransform: 'capitalize', transition: 'all 0.15s' }}>
              {tab}
            </button>
          ))}
        </div>

        {modalTab === 'details' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {([
                { label: 'Title', key: 'title', type: 'text', span: 2 },
                { label: 'Price', key: 'price', type: 'number' },
                { label: 'Currency', key: 'currency', type: 'select', options: ['USD', 'GHS', 'EUR', 'GBP', 'NGN'] },
                { label: 'Bedrooms', key: 'bedrooms', type: 'number' },
                { label: 'Bathrooms', key: 'bathrooms', type: 'number' },
                { label: 'Property Type', key: 'property_type', type: 'select', options: ['villa', 'bungalow', 'duplex', 'penthouse', 'apartment', 'mansion', 'estate'] },
                { label: 'Listing Type', key: 'listing_type', type: 'select', options: ['sale', 'rent', 'both'] },
                { label: 'Status', key: 'status', type: 'select', options: ['available', 'sold', 'rented', 'pending', 'off_market'] },
                { label: 'City', key: 'city', type: 'text' },
                { label: 'Address', key: 'address', type: 'text', span: 2 },
                { label: 'Country', key: 'country', type: 'text' },
                { label: 'Sqft', key: 'sqft', type: 'number' },
              ] as Array<{ label: string; key: string; type: string; options?: string[]; span?: number }>).map((field) => (
                <div key={field.key} style={{ gridColumn: field.span === 2 ? 'span 2' : 'span 1' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select value={(editing as any)[field.key] || ''} onChange={(e) => setEditing({ ...editing, [field.key]: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }}>
                      {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} value={(editing as any)[field.key] || ''} onChange={(e) => {
                      const val = field.type === 'number' ? Number(e.target.value) : e.target.value;
                      const next: Record<string, unknown> = { ...editing, [field.key]: val };
                      if (field.key === 'title') {
                        next.slug = (val as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                      }
                      setEditing(next as any);
                    }}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }} />
                  )}
                </div>
              ))}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Description</label>
                <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', resize: 'vertical', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setModal(null)} style={{ padding: '0.625rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text)' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}
                style={{ padding: '0.625rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}>
                {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save Property'}
              </button>
            </div>
          </>
        )}

        {modalTab === 'images' && (
          <>
            {!editing.id ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                <ImagePlus size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                <p>Save the property first, then add images.</p>
              </div>
            ) : (
              <>
                {/* Upload button */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
                    onChange={(e) => handleFilesSelected(e.target.files)} />
                  <button onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                    <ImagePlus size={16} />
                    {uploadImageMut.isPending ? 'Uploading...' : 'Upload Images'}
                  </button>
                </div>

                {/* Image grid */}
                {imagesLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <div className="spinner" style={{ width: 28, height: 28 }} />
                  </div>
                ) : images.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No images yet. Upload some above.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                    {images.map((img) => (
                      <div key={img.id} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: img.is_primary ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', aspectRatio: '4/3' }}>
                        <img src={imgUrl(img.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {img.is_primary && (
                          <div style={{ position: 'absolute', top: 4, left: 4, background: 'var(--color-primary)', borderRadius: 4, padding: '1px 5px', fontSize: '0.65rem', color: '#fff', fontWeight: 700 }}>Primary</div>
                        )}
                        <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {!img.is_primary && (
                            <button title="Set as primary" onClick={() => setPrimaryMut.mutate({ propertyId: editing.id!, imageId: img.id })}
                              style={{ width: 24, height: 24, borderRadius: 4, border: 'none', background: 'rgba(0,0,0,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0c040' }}>
                              <Star size={13} />
                            </button>
                          )}
                          <button title="Delete image" onClick={() => deleteImageMut.mutate({ propertyId: editing.id!, imageId: img.id })}
                            style={{ width: 24, height: 24, borderRadius: 4, border: 'none', background: 'rgba(0,0,0,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b6b' }}>
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Property"
        message={`"${deleteTarget?.title}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete Property"
        onConfirm={() => { deleteMut.mutate(deleteTarget!.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
