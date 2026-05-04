import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, X } from 'lucide-react';
import { crmApi } from '../../api';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { toast } from '../../components/ui/Toast';
import type { Lead } from '../../types';

const STATUS_COLUMNS = [
  { key: 'new', label: 'New', color: '#3b82f6' },
  { key: 'contacted', label: 'Contacted', color: '#f59e0b' },
  { key: 'viewing', label: 'Viewing', color: '#8b5cf6' },
  { key: 'offer', label: 'Offer', color: '#ec4899' },
  { key: 'closed', label: 'Closed', color: '#10b981' },
  { key: 'lost', label: 'Lost', color: '#6b7280' },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

const EMPTY_LEAD: Partial<Lead> = {
  name: '', email: '', phone: '', message: '',
  source: 'website', status: 'new', priority: 'medium',
};

export function LeadsPage() {
  const qc = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newLead, setNewLead] = useState<Partial<Lead>>(EMPTY_LEAD);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => crmApi.leads({ page_size: 100 }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Lead> }) => crmApi.updateLead(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated.');
    },
  });

  const createMut = useMutation({
    mutationFn: (data: Partial<Lead>) => crmApi.createLead(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created.');
      setCreateOpen(false);
      setNewLead(EMPTY_LEAD);
    },
    onError: () => toast.error('Failed to create lead.'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => crmApi.deleteLead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      setSelectedLead(null);
      toast.success('Lead deleted.');
    },
    onError: () => toast.error('Failed to delete lead.'),
  });

  const leads = data?.results || [];

  const getLeadsForStatus = (status: string) => leads.filter((l) => l.status === status);

  const handleStatusChange = (lead: Lead, newStatus: string) => {
    updateMut.mutate({ id: lead.id, data: { status: newStatus as Lead['status'] } });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>CRM — Lead Pipeline</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{leads.length} total leads</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', alignItems: 'flex-start' }}>
          {STATUS_COLUMNS.map((col) => {
            const colLeads = getLeadsForStatus(col.key);
            return (
              <div
                key={col.key}
                style={{ minWidth: 240, maxWidth: 260, flexShrink: 0 }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const leadId = parseInt(e.dataTransfer.getData('leadId'));
                  const lead = leads.find((l) => l.id === leadId);
                  if (lead && lead.status !== col.key) handleStatusChange(lead, col.key);
                }}
              >
                {/* Column header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 0.875rem', background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)', marginBottom: '0.75rem',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: col.color }} />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)' }}>{col.label}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="card"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('leadId', String(lead.id))}
                      onClick={() => setSelectedLead(lead)}
                      style={{ padding: '1rem', cursor: 'grab', transition: 'box-shadow 0.2s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)' }}>{lead.name}</span>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLORS[lead.priority] || '#94a3b8', flexShrink: 0, marginTop: 3 }} title={`Priority: ${lead.priority}`} />
                      </div>
                      {lead.email && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{lead.email}</p>}
                      {lead.phone && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{lead.phone}</p>}
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-muted" style={{ fontSize: '0.6rem' }}>{lead.source}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                          {new Date(lead.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {colLeads.length === 0 && (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--color-border)' }}>
                      Drop leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead detail side panel */}
      {selectedLead && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', justifyContent: 'flex-end' }}
          onClick={() => setSelectedLead(null)}>
          <div
            style={{ width: 380, background: 'var(--color-bg)', height: '100%', boxShadow: 'var(--shadow-xl)', overflowY: 'auto', padding: '1.5rem', borderLeft: '1px solid var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1.125rem' }}>Lead Details</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.625rem', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', color: 'var(--color-error)', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  <Trash2 size={12} /> Delete
                </button>
                <button onClick={() => setSelectedLead(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Name', value: selectedLead.name },
                { label: 'Email', value: selectedLead.email },
                { label: 'Phone', value: selectedLead.phone || '—' },
                { label: 'Source', value: selectedLead.source },
                { label: 'Status', value: selectedLead.status },
                { label: 'Priority', value: selectedLead.priority },
                { label: 'Submitted', value: new Date(selectedLead.created_at).toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{label}</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{value}</p>
                </div>
              ))}
              {selectedLead.message && (
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Message</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{selectedLead.message}</p>
                </div>
              )}

              {/* Status change */}
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Move to Stage</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {STATUS_COLUMNS.map((col) => (
                    <button key={col.key}
                      onClick={() => { handleStatusChange(selectedLead, col.key); setSelectedLead({ ...selectedLead, status: col.key as Lead['status'] }); }}
                      style={{
                        padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-full)',
                        border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                        background: selectedLead.status === col.key ? col.color : 'var(--color-surface-2)',
                        color: selectedLead.status === col.key ? '#fff' : 'var(--color-text)',
                      }}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create lead modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Lead" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {([
              { label: 'Full Name *', key: 'name', type: 'text', span: 2 },
              { label: 'Email *', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone', type: 'tel' },
            ] as Array<{ label: string; key: keyof Lead; type: string; span?: number }>).map((f) => (
              <div key={f.key} style={{ gridColumn: f.span === 2 ? 'span 2' : 'span 1' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={String(newLead[f.key] ?? '')}
                  onChange={(e) => setNewLead((p) => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' as const }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Source</label>
              <select value={newLead.source} onChange={(e) => setNewLead((p) => ({ ...p, source: e.target.value as Lead['source'] }))}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                {['website', 'referral', 'walk-in', 'call', 'social'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Priority</label>
              <select value={newLead.priority} onChange={(e) => setNewLead((p) => ({ ...p, priority: e.target.value as Lead['priority'] }))}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                {['low', 'medium', 'high'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Message / Notes</label>
            <textarea value={newLead.message} onChange={(e) => setNewLead((p) => ({ ...p, message: e.target.value }))} rows={3}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', resize: 'vertical', boxSizing: 'border-box' as const }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button onClick={() => setCreateOpen(false)} style={{ padding: '0.625rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text)' }}>Cancel</button>
            <button
              onClick={() => createMut.mutate(newLead)}
              disabled={createMut.isPending || !newLead.name || !newLead.email}
              style={{ padding: '0.625rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', opacity: !newLead.name || !newLead.email ? 0.6 : 1 }}
            >
              {createMut.isPending ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Lead"
        message={`Delete lead for "${selectedLead?.name}"? All associated notes will also be removed.`}
        confirmLabel="Delete Lead"
        onConfirm={() => {
          if (selectedLead) { deleteMut.mutate(selectedLead.id); setSelectedLead(null); }
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
