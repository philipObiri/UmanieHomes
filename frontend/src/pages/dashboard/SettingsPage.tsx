import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Loader2, CheckCircle2, AlertCircle, Save, Bell, Globe, Lock, Building2 } from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { tenantApi, authApi } from '../../api';

const POLL_INTERVAL = 3000;

function ExportSection() {
  // const [taskId, setTaskId] = useState<string | null>(null);
  const [, setTaskId] = useState<string | null>(null);
  const [exportState, setExportState] = useState<'idle' | 'pending' | 'ready' | 'failed'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => () => stopPolling(), []);

  const startExportMut = useMutation({
    mutationFn: () => tenantApi.requestExport(),
    onSuccess: (data) => {
      setTaskId(data.task_id);
      setExportState('pending');
      pollRef.current = setInterval(async () => {
        try {
          const res = await tenantApi.exportStatus(data.task_id);
          if (res.status === 'ready') {
            stopPolling();
            setExportState('ready');
            setDownloadUrl(res.download_url || null);
            toast.success('Your export is ready!');
          } else if (res.status === 'failed') {
            stopPolling();
            setExportState('failed');
            toast.error('Export failed. Please try again.');
          }
        } catch {
          stopPolling();
          setExportState('failed');
        }
      }, POLL_INTERVAL);
    },
    onError: () => toast.error('Could not start export.'),
  });

  const reset = () => {
    stopPolling();
    setTaskId(null);
    setExportState('idle');
    setDownloadUrl(null);
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
        Export Your Data
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', maxWidth: 480 }}>
        Download a complete copy of all your data (properties, leads, CMS content, financials) and uploaded
        media files as a single ZIP archive.
      </p>

      {exportState === 'idle' && (
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => startExportMut.mutate()}
          disabled={startExportMut.isPending}
        >
          <Download size={16} />
          Export All Data
        </button>
      )}

      {exportState === 'pending' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          <Loader2 size={18} className="spin" />
          Preparing your export — this may take a minute…
        </div>
      )}

      {exportState === 'ready' && downloadUrl && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontSize: '0.875rem' }}>
            <CheckCircle2 size={18} />
            Export ready
          </div>
          <a
            href={downloadUrl}
            download
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
          >
            <Download size={16} />
            Download ZIP
          </a>
          <button className="btn btn-ghost" onClick={reset} style={{ fontSize: '0.8rem' }}>
            New Export
          </button>
        </div>
      )}

      {exportState === 'failed' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-error)', fontSize: '0.875rem' }}>
            <AlertCircle size={18} />
            Export failed
          </div>
          <button className="btn btn-primary" onClick={reset}>Try Again</button>
        </div>
      )}

      <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
        <strong>What's included:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', lineHeight: 1.7 }}>
          <li>Properties, property images, and details</li>
          <li>Leads, lead notes, tour schedules, and clients</li>
          <li>Blog posts, pages, team members, testimonials, FAQs</li>
          <li>Deals, invoices, and commission records</li>
          <li>Helpdesk tickets</li>
          <li>All uploaded media files (images, documents)</li>
          <li>Tenant settings and theme configuration</li>
        </ul>
      </div>
    </div>
  );
}

function CompanyInfoSection({ tenant }: { tenant: Record<string, unknown> }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name:    (tenant.name    as string) || '',
    tagline: (tenant.tagline as string) || '',
    email:   (tenant.email   as string) || '',
    phone:   (tenant.phone   as string) || '',
    address: (tenant.address as string) || '',
    city:    (tenant.city    as string) || '',
    country: (tenant.country as string) || '',
    business_hours_start: (tenant.business_hours_start as string) || '',
    business_hours_end:   (tenant.business_hours_end   as string) || '',
  });

  const saveMut = useMutation({
    mutationFn: () => tenantApi.updateCurrent(form as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant'] });
      toast.success('Company info saved.');
    },
    onError: () => toast.error('Failed to save company info.'),
  });

  const inputStyle = {
    width: '100%', padding: '0.5rem 0.75rem',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.875rem',
    boxSizing: 'border-box' as const,
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Building2 size={16} /> Company Information
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { key: 'name',    label: 'Company Name',  span: 2 },
          { key: 'tagline', label: 'Tagline',        span: 2 },
          { key: 'email',   label: 'Contact Email'           },
          { key: 'phone',   label: 'Contact Phone'           },
          { key: 'address', label: 'Office Address', span: 2 },
          { key: 'city',    label: 'City'                    },
          { key: 'country', label: 'Country'                 },
          { key: 'business_hours_start', label: 'Office Opens (e.g. 07:00)' },
          { key: 'business_hours_end',   label: 'Office Closes (e.g. 19:00)' },
        ].map(({ key, label, span }) => (
          <div key={key} style={{ gridColumn: span === 2 ? 'span 2' : 'span 1' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
              {label}
            </label>
            <input
              style={inputStyle}
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        onClick={() => saveMut.mutate()}
        disabled={saveMut.isPending}
      >
        {saveMut.isPending ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
        Save Company Info
      </button>
    </div>
  );
}

function NotificationsSection({ settings }: { settings: Record<string, unknown> }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    notify_new_lead_email: settings.notify_new_lead_email ?? true,
    notify_new_inquiry_email: settings.notify_new_inquiry_email ?? true,
    notify_new_ticket_email: settings.notify_new_ticket_email ?? true,
    admin_notification_email: settings.admin_notification_email ?? '',
  });

  const saveMut = useMutation({
    mutationFn: () => tenantApi.updateSettings(form as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-settings'] });
      toast.success('Notification preferences saved.');
    },
    onError: () => toast.error('Failed to save.'),
  });

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Bell size={16} /> Notification Preferences
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
        {[
          { key: 'notify_new_lead_email', label: 'Email me on new leads' },
          { key: 'notify_new_inquiry_email', label: 'Email me on new property inquiries' },
          { key: 'notify_new_ticket_email', label: 'Email me on new helpdesk tickets' },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--color-text)' }}>
            <input
              type="checkbox"
              checked={!!form[key as keyof typeof form]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }}
            />
            {label}
          </label>
        ))}
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>
          Admin Notification Email
        </label>
        <input
          type="email"
          className="form-input"
          value={form.admin_notification_email as string}
          onChange={(e) => setForm((f) => ({ ...f, admin_notification_email: e.target.value }))}
          placeholder="admin@youragency.com"
          style={{ maxWidth: 360 }}
        />
      </div>

      <button
        className="btn btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        onClick={() => saveMut.mutate()}
        disabled={saveMut.isPending}
      >
        {saveMut.isPending ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
        Save Preferences
      </button>
    </div>
  );
}

function SocialSection({ settings }: { settings: Record<string, unknown> }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    facebook_url: settings.facebook_url ?? '',
    instagram_url: settings.instagram_url ?? '',
    twitter_url: settings.twitter_url ?? '',
    linkedin_url: settings.linkedin_url ?? '',
    youtube_url: settings.youtube_url ?? '',
    whatsapp_number: settings.whatsapp_number ?? '',
  });

  const saveMut = useMutation({
    mutationFn: () => tenantApi.updateSettings(form as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-settings'] });
      toast.success('Social links saved.');
    },
    onError: () => toast.error('Failed to save.'),
  });

  const fields = [
    { key: 'facebook_url', label: 'Facebook URL', placeholder: 'https://facebook.com/yourpage' },
    { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/yourhandle' },
    { key: 'twitter_url', label: 'Twitter / X URL', placeholder: 'https://twitter.com/yourhandle' },
    { key: 'linkedin_url', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/company/yourco' },
    { key: 'youtube_url', label: 'YouTube URL', placeholder: 'https://youtube.com/@yourchannel' },
    { key: 'whatsapp_number', label: 'WhatsApp Number', placeholder: '+233 24 000 0000' },
  ];

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Globe size={16} /> Social Links
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>
              {label}
            </label>
            <input
              type="text"
              className="form-input"
              value={form[key as keyof typeof form] as string}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        onClick={() => saveMut.mutate()}
        disabled={saveMut.isPending}
      >
        {saveMut.isPending ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
        Save Links
      </button>
    </div>
  );
}

function SecuritySection() {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [error, setError] = useState('');

  const saveMut = useMutation({
    mutationFn: () =>
      authApi.changePassword({ old_password: form.old_password, new_password: form.new_password }),
    onSuccess: () => {
      toast.success('Password changed.');
      setForm({ old_password: '', new_password: '', confirm: '' });
      setError('');
    },
    onError: () => toast.error('Failed to change password. Check your current password.'),
  });

  const handleSubmit = () => {
    if (form.new_password !== form.confirm) {
      setError("New passwords don't match.");
      return;
    }
    if (form.new_password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    saveMut.mutate();
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Lock size={16} /> Change Password
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 380 }}>
        {[
          { key: 'old_password', label: 'Current Password' },
          { key: 'new_password', label: 'New Password' },
          { key: 'confirm', label: 'Confirm New Password' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>
              {label}
            </label>
            <input
              type="password"
              className="form-input"
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              autoComplete="off"
            />
          </div>
        ))}

        {error && <p style={{ color: 'var(--color-error)', fontSize: '0.8rem' }}>{error}</p>}

        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}
          onClick={handleSubmit}
          disabled={saveMut.isPending}
        >
          {saveMut.isPending ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
          Update Password
        </button>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: () => tenantApi.settings(),
  });
  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ['tenant'],
    queryFn: () => tenantApi.current(),
  });

  if (settingsLoading || tenantLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 size={28} className="spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  const s = settings || {};
  const t = (tenant as Record<string, unknown>) || {};

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 0 3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Manage company info, notifications, social links, security, and data export.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <CompanyInfoSection tenant={t} />
        <NotificationsSection settings={s} />
        <SocialSection settings={s} />
        <SecuritySection />
        <ExportSection />
      </div>
    </div>
  );
}
