import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#004274', '#C9A974', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1.25rem' }}>{title}</h3>
      {children}
    </div>
  );
}

export function AnalyticsPage() {
  const { user } = useAuthStore();
  const isPlatformOwner = user?.role === 'platform_owner';

  const { data: tenantData } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsApi.dashboard(),
  });

  const { data: platformData } = useQuery({
    queryKey: ['analytics-platform'],
    queryFn: () => analyticsApi.platform(),
    enabled: isPlatformOwner,
  });

  const d = tenantData || {};
  const p = platformData || {};

  const leadFunnel = d.leads?.by_status
    ? Object.entries(d.leads.by_status).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    : [];

  const propertyTypes = d.properties?.by_type
    ? Object.entries(d.properties.by_type).map(([name, value]) => ({ name, value }))
    : [];

  const revenueByTenant = p.revenue_by_tenant || [];
  const tenantStats = p.tenant_stats || [];

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Analytics</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {isPlatformOwner ? 'Platform-wide analytics across all tenants' : 'Your tenant analytics overview'}
        </p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total Properties', value: d.properties?.total ?? '—' },
          { label: 'Available', value: d.properties?.available ?? '—' },
          { label: 'Total Leads', value: d.leads?.total ?? '—' },
          { label: 'Open Tickets', value: d.open_tickets ?? '—' },
          ...(d.revenue ? [{ label: 'Revenue', value: `$${Number(d.revenue).toLocaleString()}` }] : []),
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>{label}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {leadFunnel.length > 0 && (
          <ChartCard title="Lead Funnel">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={leadFunnel} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {propertyTypes.length > 0 && (
          <ChartCard title="Properties by Type">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={propertyTypes} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {propertyTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Platform CEO section */}
      {isPlatformOwner && (
        <>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', margin: '2rem 0 1.25rem' }}>Platform Overview</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {[
              { label: 'Active Tenants', value: p.tenants ?? '—' },
              { label: 'Platform Users', value: p.users ?? '—' },
              { label: 'All Properties', value: p.properties ?? '—' },
              { label: 'All Leads', value: p.leads ?? '—' },
              ...(p.revenue ? [{ label: 'Platform Revenue', value: `$${Number(p.revenue).toLocaleString()}` }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="card" style={{ padding: '1.25rem', borderLeft: '3px solid var(--color-accent)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>{label}</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>{value}</p>
              </div>
            ))}
          </div>

          {revenueByTenant.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <ChartCard title="Revenue by Tenant">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueByTenant} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="tenant" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                    <Tooltip contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                    <Bar dataKey="revenue" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {tenantStats.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>Tenant Summary</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                      {['Tenant', 'Plan', 'Properties', 'Leads', 'Users', 'Revenue'].map((h) => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tenantStats.map((t: any) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-text)', fontSize: '0.875rem' }}>{t.name}</td>
                        <td style={{ padding: '0.875rem 1rem' }}><span className="badge badge-muted" style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>{t.plan}</span></td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{t.properties}</td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{t.leads}</td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{t.users}</td>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                          {t.revenue ? `$${Number(t.revenue).toLocaleString()}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
