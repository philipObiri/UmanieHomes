import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Mail, Phone, User } from 'lucide-react';
import { crmApi } from '../../api';

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  agent_name?: string;
  created_at: string;
}

export function ClientsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => crmApi.clients(search ? { search } : undefined),
  });

  const clients: Client[] = data?.results ?? data ?? [];

  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Clients</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {clients.length} client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            style={{ padding: '0.5rem 0.875rem 0.5rem 2.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.875rem', width: 240 }}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : clients.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Users size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>{search ? 'No clients match your search.' : 'No clients yet. Leads that close become clients.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {clients.map((client) => (
            <div key={client.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '1.1rem',
                }}>
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.95rem', marginBottom: '0.125rem' }}>{client.name}</p>
                  {client.agent_name && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Agent: {client.agent_name}</p>
                  )}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(client.created_at)}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a
                  href={`mailto:${client.email}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none' }}
                >
                  <Mail size={14} /> {client.email}
                </a>
                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                  >
                    <Phone size={14} /> {client.phone}
                  </a>
                )}
                {client.address && (
                  <p style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <User size={14} style={{ marginTop: 2, flexShrink: 0 }} /> {client.address}
                  </p>
                )}
              </div>

              {client.notes && (
                <p style={{ marginTop: '0.875rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', paddingTop: '0.875rem', borderTop: '1px solid var(--color-border)', lineHeight: 1.5 }}>
                  {client.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
