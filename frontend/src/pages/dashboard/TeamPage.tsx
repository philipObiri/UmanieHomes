import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import { cmsApi } from '../../api';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { toast } from '../../components/ui/Toast';


interface MemberForm {
  name: string;
  role: string;
  bio: string;
  email: string;
  phone: string;
  years_experience: string;
  linkedin_url: string;
  twitter_url: string;
  order: string;
  is_active: boolean;
}

const EMPTY_FORM: MemberForm = {
  name: '', role: '', bio: '', email: '', phone: '',
  years_experience: '', linkedin_url: '', twitter_url: '',
  order: '0', is_active: true,
};

function MemberFormUI({
  initial,
  onSave,
  onClose,
  isSaving,
}: {
  initial: MemberForm;
  onSave: (fd: FormData) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<MemberForm>(initial);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof MemberForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) fd.append(k, String(v));
    });
    if (photoFile) fd.append('photo', photoFile);
    onSave(fd);
  };

  const inputStyle = {
    width: '100%', padding: '0.5rem 0.75rem',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Photo upload */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
            border: '2px solid var(--color-border)', cursor: 'pointer',
            background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {form.name?.charAt(0) || '?'}
            </span>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{ padding: '0.4rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-text)' }}
          >
            Choose Photo
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>JPG, PNG (max 5MB)</p>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {([
          { label: 'Full Name *', key: 'name', type: 'text', span: 2 },
          { label: 'Job Title / Role *', key: 'role', type: 'text', span: 2 },
          { label: 'Email', key: 'email', type: 'email' },
          { label: 'Phone', key: 'phone', type: 'tel' },
          { label: 'Years of Experience', key: 'years_experience', type: 'number' },
          { label: 'Display Order', key: 'order', type: 'number' },
          { label: 'LinkedIn URL', key: 'linkedin_url', type: 'url' },
          { label: 'Twitter / X URL', key: 'twitter_url', type: 'url' },
        ] as Array<{ label: string; key: keyof MemberForm; type: string; span?: number }>).map((f) => (
          <div key={f.key} style={{ gridColumn: f.span === 2 ? 'span 2' : 'span 1' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>{f.label}</label>
            <input
              type={f.type}
              value={String(form[f.key] ?? '')}
              onChange={(e) => set(f.key, e.target.value)}
              style={inputStyle}
            />
          </div>
        ))}
      </div>

      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => set('bio', e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text)' }}>
        <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
        Active (visible on website)
      </label>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
        <button onClick={onClose} style={{ padding: '0.625rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text)' }}>
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !form.name || !form.role}
          style={{ padding: '0.625rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', opacity: isSaving || !form.name || !form.role ? 0.6 : 1 }}
        >
          {isSaving ? 'Saving...' : 'Save Member'}
        </button>
      </div>
    </div>
  );
}

export function TeamPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [initialForm, setInitialForm] = useState<MemberForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['team-members-admin'],
    queryFn: () => cmsApi.team(),
  });

  const members = data?.results || [];

  const createMut = useMutation({
    mutationFn: (fd: FormData) => cmsApi.createTeamMember(fd),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team-members-admin'] }); qc.invalidateQueries({ queryKey: ['team'] }); toast.success('Member added.'); setModalOpen(false); },
    onError: () => toast.error('Failed to add member.'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, fd }: { id: number; fd: FormData }) => cmsApi.updateTeamMember(id, fd),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team-members-admin'] }); qc.invalidateQueries({ queryKey: ['team'] }); toast.success('Member updated.'); setModalOpen(false); },
    onError: () => toast.error('Failed to update member.'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => cmsApi.deleteTeamMember(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team-members-admin'] }); qc.invalidateQueries({ queryKey: ['team'] }); toast.success('Member deleted.'); },
    onError: () => toast.error('Failed to delete member.'),
  });

  const openCreate = () => {
    setEditingId(null);
    setInitialForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (m: any) => {
    setEditingId(m.id);
    setInitialForm({
      name: m.name || '', role: m.role || '', bio: m.bio || '',
      email: m.email || '', phone: m.phone || '',
      years_experience: m.years_experience ? String(m.years_experience) : '',
      linkedin_url: m.linkedin_url || '', twitter_url: m.twitter_url || '',
      order: m.order != null ? String(m.order) : '0',
      is_active: m.is_active !== false,
    });
    setModalOpen(true);
  };

  const handleSave = (fd: FormData) => {
    if (editingId) updateMut.mutate({ id: editingId, fd });
    else createMut.mutate(fd);
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Team Members</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{members.length} members</p>
        </div>
        <button
          onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}
        >
          <UserPlus size={16} /> Add Member
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                  {['Member', 'Role', 'Contact', 'Experience', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m: any) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-surface)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: 'var(--color-surface-2)', flexShrink: 0 }}>
                          {m.photo_url ? (
                            <img src={m.photo_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--color-primary)' }}>
                              {m.name?.charAt(0) ?? '?'}
                            </div>
                          )}
                        </div>
                        <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>{m.name}</p>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{m.role}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {m.email && <p>{m.email}</p>}
                      {m.phone && <p>{m.phone}</p>}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      {m.years_experience ? `${m.years_experience}+ yrs` : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className="badge" style={{ fontSize: '0.65rem', background: m.is_active !== false ? 'var(--color-success)' : 'var(--color-surface-2)', color: m.is_active !== false ? '#fff' : 'var(--color-text-secondary)' }}>
                        {m.is_active !== false ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button onClick={() => openEdit(m)}
                          style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: m.id, name: m.name })}
                          style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-error)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No team members yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Team Member' : 'Add Team Member'} size="lg">
        <MemberFormUI
          initial={initialForm}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          isSaving={isSaving}
        />
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Team Member"
        message={`Remove "${deleteTarget?.name}" from the team? This cannot be undone.`}
        confirmLabel="Remove Member"
        onConfirm={() => { deleteMut.mutate(deleteTarget!.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
