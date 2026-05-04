import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, RefreshCw, Plus } from 'lucide-react';
import { helpdeskApi } from '../../api';
import { Modal } from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const STATUS_COLORS: Record<string, string> = {
  open: 'var(--color-info)', in_progress: '#f59e0b',
  resolved: 'var(--color-success)', closed: 'var(--color-text-muted)',
};

interface ChatMessage {
  id: string;
  message: string;
  is_from_agent: boolean;
  timestamp: string;
}

const EMPTY_TICKET = { subject: '', description: '', priority: 'medium' };

export function HelpdeskPage() {
  const qc = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTicket, setNewTicket] = useState(EMPTY_TICKET);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: ticketsData, refetch } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => helpdeskApi.tickets(),
  });

  const tickets = ticketsData?.results || [];

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => helpdeskApi.updateTicket(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tickets'] }); toast.success('Ticket updated.'); },
    onError: () => toast.error('Failed to update ticket.'),
  });

  const createMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => helpdeskApi.createTicket(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket created.');
      setCreateOpen(false);
      setNewTicket(EMPTY_TICKET);
    },
    onError: () => toast.error('Failed to create ticket.'),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const connectToSession = (session: any) => {
    wsRef.current?.close();
    setChatMessages([]);
    const ws = new WebSocket(`${WS_BASE}/ws/chat/${session.session_key}/`);
    wsRef.current = ws;
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'message') {
        setChatMessages((prev) => [...prev, {
          id: Date.now().toString(), message: data.message,
          is_from_agent: data.is_from_agent,
          timestamp: data.timestamp || new Date().toISOString(),
        }]);
      }
    };
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'message', message: chatInput.trim(), is_from_agent: true }));
    setChatMessages((prev) => [...prev, {
      id: Date.now().toString(), message: chatInput.trim(),
      is_from_agent: true, timestamp: new Date().toISOString(),
    }]);
    setChatInput('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Helpdesk</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Support tickets and live chat management</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={16} /> New Ticket
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Tickets list */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1rem' }}>
              Tickets ({tickets.length})
            </h3>
            <button onClick={() => refetch()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <RefreshCw size={14} />
            </button>
          </div>
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {tickets.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <MessageSquare size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <p>No tickets yet</p>
              </div>
            ) : (
              tickets.map((ticket: any) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{
                    padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer', transition: 'background 0.15s',
                    background: selectedTicket?.id === ticket.id ? 'rgba(0,66,116,0.05)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (selectedTicket?.id !== ticket.id) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface)'; }}
                  onMouseLeave={(e) => { if (selectedTicket?.id !== ticket.id) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)' }}>{ticket.subject}</span>
                    <span className="badge" style={{
                      fontSize: '0.6rem',
                      background: STATUS_COLORS[ticket.status] || 'var(--color-surface-2)',
                      color: ticket.status === 'open' || ticket.status === 'resolved' ? '#fff' : 'var(--color-text-secondary)',
                    }}>
                      {ticket.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    #{ticket.reference_number} · {ticket.priority} priority · {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket detail / chat */}
        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {selectedTicket ? (
            <>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>{selectedTicket.subject}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  #{selectedTicket.reference_number} · {new Date(selectedTicket.created_at).toLocaleDateString()}
                </p>
                {/* Status + priority controls */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Status</label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setSelectedTicket((t: any) => ({ ...t, status: newStatus }));
                        updateMut.mutate({ id: selectedTicket.id, data: { status: newStatus } });
                      }}
                      style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8rem' }}
                    >
                      {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Priority</label>
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => {
                        const newPriority = e.target.value;
                        setSelectedTicket((t: any) => ({ ...t, priority: newPriority }));
                        updateMut.mutate({ id: selectedTicket.id, data: { priority: newPriority } });
                      }}
                      style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8rem' }}
                    >
                      {TICKET_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {selectedTicket.chat_session ? (
                <>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 360 }}>
                    {chatMessages.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem', fontSize: '0.875rem' }}>
                        <button
                          onClick={() => connectToSession(selectedTicket.chat_session)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>
                          <RefreshCw size={14} /> Connect to Chat
                        </button>
                      </div>
                    )}
                    {chatMessages.map((msg) => (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: msg.is_from_agent ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '75%', padding: '0.625rem 0.875rem',
                          borderRadius: msg.is_from_agent ? '12px 0 12px 12px' : '0 12px 12px 12px',
                          background: msg.is_from_agent ? 'var(--color-primary)' : 'var(--color-surface-2)',
                          color: msg.is_from_agent ? '#fff' : 'var(--color-text)', fontSize: '0.875rem',
                        }}>
                          <p>{msg.message}</p>
                          <p style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem', textAlign: 'right' }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                  <div style={{ padding: '0.875rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem' }}>
                    <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                      placeholder="Type a reply..."
                      style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }} />
                    <button onClick={sendMessage} style={{ padding: '0.5rem', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
                      <Send size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '2rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, flex: 1 }}>
                  <p style={{ marginBottom: '0.75rem' }}>{selectedTicket.description}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No chat session attached to this ticket.</p>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--color-text-muted)', flexDirection: 'column', gap: '0.75rem', padding: '3rem' }}>
              <MessageSquare size={36} style={{ opacity: 0.3 }} />
              <p>Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Create ticket modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Support Ticket" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Subject *</label>
            <input
              value={newTicket.subject}
              onChange={(e) => setNewTicket((t) => ({ ...t, subject: e.target.value }))}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Priority</label>
            <select
              value={newTicket.priority}
              onChange={(e) => setNewTicket((t) => ({ ...t, priority: e.target.value }))}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
            >
              {TICKET_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Description *</label>
            <textarea
              value={newTicket.description}
              onChange={(e) => setNewTicket((t) => ({ ...t, description: e.target.value }))}
              rows={4}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button onClick={() => setCreateOpen(false)} style={{ padding: '0.625rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text)' }}>Cancel</button>
            <button
              onClick={() => createMut.mutate(newTicket)}
              disabled={createMut.isPending || !newTicket.subject || !newTicket.description}
              style={{ padding: '0.625rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', opacity: !newTicket.subject || !newTicket.description ? 0.6 : 1 }}
            >
              {createMut.isPending ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
