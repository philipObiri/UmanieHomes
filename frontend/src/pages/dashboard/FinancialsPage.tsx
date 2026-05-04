import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Plus } from 'lucide-react';
import { financialsApi } from '../../api';
import { Modal } from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';

type Tab = 'deals' | 'commissions' | 'invoices';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', approved: '#3b82f6', paid: '#10b981',
  negotiating: '#f59e0b', under_offer: '#8b5cf6', completed: '#10b981', cancelled: '#ef4444',
};

const DEAL_STATUSES = ['negotiating', 'under_offer', 'completed', 'cancelled'];
const INVOICE_STATUSES = ['pending', 'approved', 'paid', 'cancelled'];
const CURRENCIES = ['USD', 'GHS', 'EUR', 'GBP', 'NGN'];

const inputStyle = {
  width: '100%', padding: '0.5rem 0.75rem',
  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
  background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' as const,
};

const EMPTY_DEAL = { deal_type: 'sale', status: 'negotiating', deal_value: '', currency: 'USD', commission_rate: '3', notes: '' };
const EMPTY_INVOICE = { client_name: '', client_email: '', total: '', currency: 'USD', status: 'pending', due_date: '', notes: '' };

export function FinancialsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('deals');
  const [dealOpen, setDealOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [newDeal, setNewDeal] = useState(EMPTY_DEAL);
  const [newInvoice, setNewInvoice] = useState(EMPTY_INVOICE);

  const { data: dealsData } = useQuery({
    queryKey: ['deals'],
    queryFn: () => financialsApi.deals(),
    enabled: tab === 'deals',
  });

  const { data: commissionsData } = useQuery({
    queryKey: ['commissions'],
    queryFn: () => financialsApi.commissions(),
    enabled: tab === 'commissions',
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => financialsApi.invoices(),
    enabled: tab === 'invoices',
  });

  const createDealMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => financialsApi.createDeal(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); toast.success('Deal created.'); setDealOpen(false); setNewDeal(EMPTY_DEAL); },
    onError: () => toast.error('Failed to create deal.'),
  });

  const updateDealMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => financialsApi.updateDeal(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); toast.success('Deal updated.'); },
    onError: () => toast.error('Failed to update deal.'),
  });

  const createInvoiceMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => financialsApi.createInvoice(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice created.'); setInvoiceOpen(false); setNewInvoice(EMPTY_INVOICE); },
    onError: () => toast.error('Failed to create invoice.'),
  });

  const updateInvoiceMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => financialsApi.updateInvoice(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice updated.'); },
    onError: () => toast.error('Failed to update invoice.'),
  });

  const downloadPdf = async (id: number, number: string) => {
    try {
      const blob = await financialsApi.invoicePdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Invoice-${number}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Failed to download PDF.'); }
  };

  const deals = dealsData?.results || [];
  const commissions = commissionsData?.results || [];
  const invoices = invoicesData?.results || [];

  const TabBtn = ({ t, label }: { t: Tab; label: string }) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)', border: 'none',
        cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
        background: tab === t ? 'var(--color-primary)' : 'transparent',
        color: tab === t ? '#fff' : 'var(--color-text-secondary)',
        transition: 'all 0.2s', textTransform: 'capitalize',
      }}
    >{label}</button>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Financials</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Deals, commissions, and invoicing</p>
        </div>
        {tab === 'deals' && (
          <button onClick={() => setDealOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={16} /> New Deal
          </button>
        )}
        {tab === 'invoices' && (
          <button onClick={() => setInvoiceOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={16} /> New Invoice
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--color-surface)', padding: '0.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', width: 'fit-content', border: '1px solid var(--color-border)' }}>
        <TabBtn t="deals" label="Deals" />
        <TabBtn t="commissions" label="Commissions" />
        <TabBtn t="invoices" label="Invoices" />
      </div>

      {/* Deals */}
      {tab === 'deals' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                  {['Reference', 'Type', 'Status', 'Value', 'Commission', 'Agent', 'Date'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deals.map((deal: any) => (
                  <tr key={deal.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>{deal.reference}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{deal.deal_type}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <select
                        value={deal.status}
                        onChange={(e) => updateDealMut.mutate({ id: deal.id, data: { status: e.target.value } })}
                        style={{ padding: '0.2rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: STATUS_COLORS[deal.status] || '#94a3b8', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {DEAL_STATUSES.map((s) => <option key={s} value={s} style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                      {deal.currency} {parseFloat(deal.deal_value || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-success)' }}>
                      {deal.commission_amount ? `${deal.currency} ${parseFloat(deal.commission_amount).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{deal.agent?.full_name || '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(deal.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {deals.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No deals yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commissions */}
      {tab === 'commissions' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                  {['Deal', 'Agent', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commissions.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>{c.deal?.reference || c.deal}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{c.agent?.full_name || '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-success)', fontSize: '0.875rem' }}>
                      {c.currency} {parseFloat(c.amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className="badge" style={{ fontSize: '0.65rem', background: STATUS_COLORS[c.status] || '#94a3b8', color: '#fff' }}>{c.status}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {commissions.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No commissions yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices */}
      {tab === 'invoices' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                  {['Invoice #', 'Client', 'Total', 'Status', 'Due Date', 'PDF'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)' }}>{inv.invoice_number}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{inv.client_name}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                      {inv.currency} {parseFloat(inv.total || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <select
                        value={inv.status}
                        onChange={(e) => updateInvoiceMut.mutate({ id: inv.id, data: { status: e.target.value } })}
                        style={{ padding: '0.2rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: STATUS_COLORS[inv.status] || '#94a3b8', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {INVOICE_STATUSES.map((s) => <option key={s} value={s} style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button onClick={() => downloadPdf(inv.id, inv.invoice_number)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                        <Download size={13} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No invoices yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Deal Modal */}
      <Modal open={dealOpen} onClose={() => setDealOpen(false)} title="Create Deal" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Deal Type</label>
              <select value={newDeal.deal_type} onChange={(e) => setNewDeal((d) => ({ ...d, deal_type: e.target.value }))} style={inputStyle}>
                {['sale', 'rent', 'lease'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Status</label>
              <select value={newDeal.status} onChange={(e) => setNewDeal((d) => ({ ...d, status: e.target.value }))} style={inputStyle}>
                {DEAL_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Deal Value *</label>
              <input type="number" value={newDeal.deal_value} onChange={(e) => setNewDeal((d) => ({ ...d, deal_value: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Currency</label>
              <select value={newDeal.currency} onChange={(e) => setNewDeal((d) => ({ ...d, currency: e.target.value }))} style={inputStyle}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Commission Rate (%)</label>
              <input type="number" value={newDeal.commission_rate} onChange={(e) => setNewDeal((d) => ({ ...d, commission_rate: e.target.value }))} step="0.1" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Notes</label>
            <textarea value={newDeal.notes} onChange={(e) => setNewDeal((d) => ({ ...d, notes: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button onClick={() => setDealOpen(false)} style={{ padding: '0.625rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text)' }}>Cancel</button>
            <button
              onClick={() => createDealMut.mutate(newDeal)}
              disabled={createDealMut.isPending || !newDeal.deal_value}
              style={{ padding: '0.625rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', opacity: !newDeal.deal_value ? 0.6 : 1 }}
            >
              {createDealMut.isPending ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Invoice Modal */}
      <Modal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} title="Create Invoice" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Client Name *</label>
              <input value={newInvoice.client_name} onChange={(e) => setNewInvoice((i) => ({ ...i, client_name: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Client Email</label>
              <input type="email" value={newInvoice.client_email} onChange={(e) => setNewInvoice((i) => ({ ...i, client_email: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Total Amount *</label>
              <input type="number" value={newInvoice.total} onChange={(e) => setNewInvoice((i) => ({ ...i, total: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Currency</label>
              <select value={newInvoice.currency} onChange={(e) => setNewInvoice((i) => ({ ...i, currency: e.target.value }))} style={inputStyle}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Due Date</label>
              <input type="date" value={newInvoice.due_date} onChange={(e) => setNewInvoice((i) => ({ ...i, due_date: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.375rem' }}>Notes</label>
            <textarea value={newInvoice.notes} onChange={(e) => setNewInvoice((i) => ({ ...i, notes: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button onClick={() => setInvoiceOpen(false)} style={{ padding: '0.625rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text)' }}>Cancel</button>
            <button
              onClick={() => createInvoiceMut.mutate(newInvoice)}
              disabled={createInvoiceMut.isPending || !newInvoice.client_name || !newInvoice.total}
              style={{ padding: '0.625rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', opacity: !newInvoice.client_name || !newInvoice.total ? 0.6 : 1 }}
            >
              {createInvoiceMut.isPending ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
