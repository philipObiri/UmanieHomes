import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CalendarDays, Clock, User, Home, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { crmApi } from '../../api';
import { Modal } from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';

interface Tour {
  id: number;
  lead: number;
  lead_name?: string;
  property?: number;
  property_title?: string;
  agent?: number;
  agent_name?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes: string;
}

const STATUS_CONFIG: Record<Tour['status'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  scheduled: { label: 'Scheduled', color: '#1d4ed8', bg: '#dbeafe', icon: <CalendarDays size={13} /> },
  completed: { label: 'Completed', color: '#065f46', bg: '#d1fae5', icon: <CheckCircle size={13} /> },
  cancelled: { label: 'Cancelled', color: '#7f1d1d', bg: '#fee2e2', icon: <XCircle size={13} /> },
  no_show: { label: 'No Show', color: '#78350f', bg: '#fef3c7', icon: <AlertCircle size={13} /> },
};

function StatusBadge({ status }: { status: Tour['status'] }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.6rem', borderRadius: 99,
      fontSize: '0.72rem', fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function TourForm({ onSave, onClose }: { onSave: (data: Partial<Tour>) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<Tour>>({
    scheduled_at: '',
    duration_minutes: 60,
    status: 'scheduled',
    notes: '',
    lead: undefined,
    property: undefined,
    agent: undefined,
  });

  const set = (k: keyof Tour, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Date & Time *</label>
          <input
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => set('scheduled_at', e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Duration (min)</label>
          <input
            type="number"
            value={form.duration_minutes}
            onChange={(e) => set('duration_minutes', parseInt(e.target.value))}
            min={15}
            step={15}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Lead ID</label>
          <input
            type="number"
            value={form.lead ?? ''}
            onChange={(e) => set('lead', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Lead ID"
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Status</label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          >
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={3}
          placeholder="Any notes about this tour…"
          style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
        <button onClick={onClose} style={{ padding: '0.625rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text)' }}>Cancel</button>
        <button
          onClick={() => onSave(form)}
          style={{ padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}
        >
          Schedule Tour
        </button>
      </div>
    </div>
  );
}

export function TourSchedulerPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tours', statusFilter],
    queryFn: () => crmApi.tours(statusFilter ? { status: statusFilter } : undefined),
  });

  const tours: Tour[] = data?.results ?? data ?? [];

  const createTour = useMutation({
    mutationFn: (payload: Partial<Tour>) => crmApi.createTour(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tours'] });
      setModalOpen(false);
      toast.success('Tour scheduled.');
    },
    onError: () => toast.error('Failed to schedule tour.'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Tour['status'] }) => crmApi.updateTour(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tours'] }); toast.success('Tour updated.'); },
    onError: () => toast.error('Failed to update tour.'),
  });

  const formatDt = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Tour Scheduler</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Schedule and manage property viewings</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.875rem' }}
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button
            onClick={() => setModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}
          >
            <Plus size={16} /> Schedule Tour
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : tours.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <CalendarDays size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>No tours scheduled yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tours.map((tour) => (
            <div key={tour.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    <Clock size={16} />
                    <span style={{ fontSize: '0.95rem' }}>{formatDt(tour.scheduled_at)}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>({tour.duration_minutes} min)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {tour.lead_name && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        <User size={13} /> {tour.lead_name}
                      </span>
                    )}
                    {tour.property_title && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        <Home size={13} /> {tour.property_title}
                      </span>
                    )}
                    {tour.agent_name && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        <User size={13} /> Agent: {tour.agent_name}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={tour.status} />
                  {tour.status === 'scheduled' && (
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button
                        onClick={() => updateStatus.mutate({ id: tour.id, status: 'completed' })}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: 'var(--color-success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Mark Done
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: tour.id, status: 'cancelled' })}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: 'var(--color-error)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {tour.notes && (
                <p style={{ marginTop: '0.625rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '0.625rem' }}>
                  {tour.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule a Tour">
        <TourForm onSave={(data) => createTour.mutate(data)} onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
