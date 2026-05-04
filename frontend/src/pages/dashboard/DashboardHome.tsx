import { useQuery } from '@tanstack/react-query';
import { Building2, Users, TrendingUp, DollarSign, Eye, Headphones, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#004274', '#C9A974', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function KpiCard({ icon: Icon, label, value, change, color }: { icon: any; label: string; value: string | number; change?: string; color?: string }) {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>{label}</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{value}</p>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: color || 'rgba(0,66,116,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color ? '#fff' : 'var(--color-primary)'} />
        </div>
      </div>
      {change && (
        <p style={{ fontSize: '0.75rem', color: change.startsWith('+') ? 'var(--color-success)' : 'var(--color-error)' }}>
          {change} from last month
        </p>
      )}
    </div>
  );
}

export function DashboardHome() {
  const { user } = useAuthStore();
  const { data: analytics } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsApi.dashboard(),
  });

  const { data: platform } = useQuery({
    queryKey: ['analytics-platform'],
    queryFn: () => analyticsApi.platform(),
    enabled: user?.role === 'platform_owner',
  });

  const d = analytics || {};
  const p = platform || {};

  const leadFunnel = d.leads?.by_status ? Object.entries(d.leads.by_status).map(([name, value]) => ({ name, value })) : [];
  const revenueData = p.revenue_by_tenant || [];
  const activityFeed = p.activity_feed || [];

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
          Welcome back{user?.first_name ? `, ${user.first_name}` : ''}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Here's what's happening today.
        </p>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <KpiCard icon={Building2} label="Total Properties" value={d.properties?.total ?? '--'} change="+2" />
        <KpiCard icon={Eye} label="Available" value={d.properties?.available ?? '--'} />
        <KpiCard icon={TrendingUp} label="Total Leads" value={d.leads?.total ?? '--'} change="+8" />
        <KpiCard icon={Headphones} label="Open Tickets" value={d.open_tickets ?? '--'} />
        {d.revenue && (
          <KpiCard icon={DollarSign} label="Revenue" value={`$${Number(d.revenue).toLocaleString()}`} change="+15%" color="var(--color-primary)" />
        )}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Lead funnel */}
        {leadFunnel.length > 0 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text)' }}>Lead Funnel</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leadFunnel} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Properties by status */}
        {d.properties && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text)' }}>Properties by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Available', value: d.properties.available || 0 },
                    { name: 'Sold', value: d.properties.sold || 0 },
                    { name: 'Rented', value: d.properties.rented || 0 },
                    { name: 'Pending', value: d.properties.pending || 0 },
                  ].filter(i => i.value > 0)}
                  cx="50%" cy="50%" outerRadius={80}
                  dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Platform CEO section */}
      {user?.role === 'platform_owner' && p && (
        <>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', margin: '2rem 0 1rem' }}>
            Platform Overview
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Tenants', value: p.tenants },
              { label: 'Total Users', value: p.users },
              { label: 'All Properties', value: p.properties },
              { label: 'All Leads', value: p.leads },
              { label: 'Platform Revenue', value: p.revenue ? `$${Number(p.revenue).toLocaleString()}` : '--' },
            ].map(({ label, value }) => (
              <div key={label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>{value ?? '--'}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Revenue by tenant chart */}
          {revenueData.length > 0 && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text)' }}>Revenue by Tenant</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenueData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="tenant" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                  <Bar dataKey="revenue" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Activity feed */}
          {activityFeed.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text)' }}>Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activityFeed.slice(0, 10).map((act: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', padding: '0.625rem 0', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,66,116,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users size={14} color="var(--color-primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontWeight: 500 }}>
                        <strong>{act.user}</strong> {act.action} <span style={{ color: 'var(--color-text-muted)' }}>{act.object_repr}</span>
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>{act.tenant} · {new Date(act.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        {[
          { label: 'Add Property', to: '/dashboard/properties', icon: Building2 },
          { label: 'View Leads', to: '/dashboard/crm/leads', icon: TrendingUp },
          { label: 'Helpdesk', to: '/dashboard/helpdesk', icon: Headphones },
          { label: 'Theme', to: '/dashboard/theme', icon: Star },
        ].map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '1rem 1.25rem', background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
              color: 'var(--color-text)', fontWeight: 600, fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'rgba(0,66,116,0.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-surface)'; }}
          >
            <Icon size={18} color="var(--color-primary)" />
            {label}
            <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
