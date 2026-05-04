import { useState, useRef, useEffect } from 'react';
const uhaLogo = '/main_logo.png';
import { Outlet, Link, useLocation, useNavigate, ScrollRestoration } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Headphones,
  BarChart3, DollarSign, Palette, Settings, LogOut, ChevronLeft,
  ChevronRight, Bell, Search, Megaphone, Menu, X,
  TrendingUp, CalendarDays, UserCheck, CheckCheck, Quote, Images,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { useTenantStore } from '../../stores/tenantStore';
import { notificationsApi } from '../../api';
import { toast } from '../ui/Toast';

const navGroups = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Properties', to: '/dashboard/properties', icon: Building2 },
      { label: 'Blog', to: '/dashboard/cms/blog', icon: Megaphone },
      { label: 'Gallery', to: '/dashboard/gallery', icon: Images },
      { label: 'Testimonials', to: '/dashboard/cms/testimonials', icon: Quote },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'CRM / Leads', to: '/dashboard/crm/leads', icon: TrendingUp },
      { label: 'Tours', to: '/dashboard/crm/tours', icon: CalendarDays },
      { label: 'Clients', to: '/dashboard/crm/clients', icon: UserCheck },
      { label: 'Helpdesk', to: '/dashboard/helpdesk', icon: Headphones },
      { label: 'Team', to: '/dashboard/team', icon: Users },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Financials', to: '/dashboard/financials', icon: DollarSign },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Theme', to: '/dashboard/theme', icon: Palette },
      { label: 'Settings', to: '/dashboard/settings', icon: Settings },
    ],
  },
];

function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
  });

  const markReadMut = useMutation({
    mutationFn: (ids: number[]) => notificationsApi.markRead(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const items: any[] = Array.isArray(data) ? data : (data?.results ?? []);
  const unread = items.filter((n: any) => !n.is_read);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
        width: 340, background: '#fff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
        border: '1px solid #e2e8f0',
        zIndex: 500, overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
          Notifications {unread.length > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: '0.7rem', marginLeft: 4 }}>{unread.length}</span>}
        </span>
        {unread.length > 0 && (
          <button
            onClick={() => markReadMut.mutate(unread.map((n: any) => n.id))}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#004274', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
            No notifications yet
          </div>
        ) : (
          items.slice(0, 15).map((n: any) => (
            <div
              key={n.id}
              onClick={() => { if (!n.is_read) markReadMut.mutate([n.id]); }}
              style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #f8fafc',
                background: n.is_read ? '#fff' : '#f0f7ff',
                cursor: n.is_read ? 'default' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              <p style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: n.is_read ? 400 : 600, marginBottom: 2 }}>
                {n.title || n.message || 'Notification'}
              </p>
              {n.body && <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{n.body}</p>}
              {n.created_at && (
                <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 3 }}>
                  {new Date(n.created_at).toLocaleString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { tenant } = useTenantStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Notification unread count
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
    refetchInterval: 30000,
  });
  const notifItems: any[] = Array.isArray(notifData) ? notifData : (notifData?.results ?? []);
  const unreadCount = notifItems.filter((n: any) => !n.is_read).length;

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out successfully.');
    navigate('/login');
  };

  const isActive = (to: string) => {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(to);
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Logo */}
      <div style={{
        padding: '1.25rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, background: 'rgba(0,0,0,0.15)',
      }}>
        {(!collapsed || mobile) && (
          <Link to="/dashboard" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, textDecoration: 'none', gap: 4 }}>
            <img src={uhaLogo} alt={tenant?.name || 'Umanie Homes Africa'}
              style={{ height: 34, width: 'auto', objectFit: 'contain', maxWidth: 140 }} />
            <span style={{ fontSize: '0.6rem', color: '#C9A974', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {user?.role?.replace(/_/g, ' ') || 'Dashboard'}
            </span>
          </Link>
        )}
        {mobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.375rem', cursor: 'pointer', color: '#fff', display: 'flex' }}
          >
            <X size={16} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed((v) => !v)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.375rem', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'background 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.625rem 0.625rem' }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: '0.5rem' }}>
            {(!collapsed || mobile) && (
              <p style={{ fontSize: '0.58rem', fontWeight: 700, color: 'rgba(201,169,116,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0.625rem 0.75rem 0.25rem' }}>
                {group.label}
              </p>
            )}
            {group.items.map(({ label, to, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  title={(!mobile && collapsed) ? label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: (!mobile && collapsed) ? '0.7rem' : '0.6rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    justifyContent: (!mobile && collapsed) ? 'center' : 'flex-start',
                    marginBottom: '0.125rem',
                    color: active ? '#ffffff' : 'rgba(255,255,255,0.75)',
                    background: active ? 'rgba(201,169,116,0.18)' : 'transparent',
                    borderLeft: active ? '3px solid #C9A974' : '3px solid transparent',
                    fontSize: '0.85rem', fontWeight: active ? 600 : 400,
                    textDecoration: 'none', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; } }}
                >
                  <Icon size={16} style={{ flexShrink: 0, color: active ? '#C9A974' : 'inherit' }} />
                  {(mobile || !collapsed) && <span>{label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User / logout */}
      <div style={{ padding: '0.75rem 0.625rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)', flexShrink: 0 }}>
        {(!collapsed || mobile) && user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', marginBottom: '0.375rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A974, #b8944d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.85rem', flexShrink: 0 }}>
              {user.first_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.first_name} {user.last_name}
              </p>
              <p style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: (!mobile && collapsed) ? '0.7rem' : '0.6rem 0.875rem',
            width: '100%', borderRadius: 'var(--radius-md)',
            border: 'none', cursor: 'pointer', background: 'transparent',
            color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem',
            justifyContent: (!mobile && collapsed) ? 'center' : 'flex-start',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={16} />
          {(mobile || !collapsed) && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* ── Desktop sidebar ── */}
      <aside
        style={{
          width: collapsed ? 64 : 'var(--sidebar-width)',
          background: '#0A1F44',
          height: '100vh',
          position: 'fixed', top: 0, left: 0, zIndex: 200,
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
        }}
        className="dashboard-sidebar-desktop"
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, backdropFilter: 'blur(2px)' }}
        />
      )}
      <aside
        style={{
          width: 260,
          background: '#0A1F44',
          height: '100vh',
          position: 'fixed', top: 0, left: mobileOpen ? 0 : -280, zIndex: 310,
          display: 'flex', flexDirection: 'column',
          transition: 'left 0.28s cubic-bezier(0.16,1,0.3,1)',
          overflow: 'hidden',
          boxShadow: mobileOpen ? '4px 0 32px rgba(0,0,0,0.3)' : 'none',
        }}
        className="dashboard-sidebar-mobile"
      >
        <SidebarContent mobile />
      </aside>

      {/* ── Main content ── */}
      <div
        style={{
          flex: 1,
          marginLeft: collapsed ? 64 : 'var(--sidebar-width)',
          transition: 'margin-left 0.3s ease',
          display: 'flex', flexDirection: 'column', minHeight: '100vh',
        }}
        className="dashboard-main"
      >
        {/* Top bar */}
        <header style={{
          height: 60, background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.25rem', position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          gap: '0.75rem',
        }}>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="mobile-hamburger"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '0.375rem', display: 'none', alignItems: 'center', flexShrink: 0 }}
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            flex: 1, maxWidth: 360,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)', padding: '0.4rem 0.875rem',
          }}>
            <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              placeholder="Search..."
              style={{ border: 'none', background: 'transparent', outline: 'none', color: '#1e293b', fontSize: '0.875rem', width: '100%' }}
            />
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {/* Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setBellOpen((v) => !v)}
                style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)', padding: '0.45rem 0.65rem',
                  cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center',
                  position: 'relative', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#ef4444', border: '1.5px solid #fff',
                  }} />
                )}
              </button>
              {bellOpen && <NotificationsDropdown onClose={() => setBellOpen(false)} />}
            </div>

            <Link
              to="/"
              style={{
                padding: '0.45rem 1rem',
                background: '#0A1F44', color: '#ffffff',
                border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem', fontWeight: 600,
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              View Site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <ScrollRestoration />

      <style>{`
        @media (max-width: 768px) {
          .dashboard-sidebar-desktop { display: none !important; }
          .mobile-hamburger { display: flex !important; }
          .dashboard-main { margin-left: 0 !important; }
        }
        @media (min-width: 769px) {
          .dashboard-sidebar-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
