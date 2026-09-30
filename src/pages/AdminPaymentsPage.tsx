import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { LoaderCircle, RefreshCw } from 'lucide-react';

type AdminOrder = { orderId: string; customer: string; email: string; product: string; amount: number; status: string; createdAt: string; paidAt: string | null };
type UnmatchedPayment = { orderId: string | null; amount: number | null; processedAt: string; status: string };
const filters = ['ALL', 'PENDING', 'VERIFYING', 'PAID', 'FAILED', 'EXPIRED', 'MANUAL_REVIEW'];

export const AdminPaymentsPage = () => {
  const { session } = useAuth();
  const [filter, setFilter] = useState('ALL');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedPayment[]>([]);
  const [reason, setReason] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const request = async (path: string, init: RequestInit = {}) => {
    if (!session?.access_token) throw new Error('Sign in with the configured admin account.');
    const response = await fetch(`/api${path}`, { ...init, headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json', ...(init.headers || {}) } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Payment dashboard request failed.');
    return result;
  };
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await request(`/payments/admin/orders${filter === 'ALL' ? '' : `?status=${filter}`}`);
      setOrders(data.orders);
      setUnmatched(data.unmatchedPayments || []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load payments.'); }
    finally { setLoading(false); }
  }, [session?.access_token, filter]);
  useEffect(() => { load(); }, [load]);

  const processInbox = async () => {
    setBusy('inbox'); setError('');
    try { await request('/payments/admin/process', { method: 'POST', body: '{}' }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Gmail processing failed.'); }
    finally { setBusy(''); }
  };
  const approve = async (orderId: string) => {
    if ((reason[orderId] || '').trim().length < 5) { setError('Enter a reason of at least five characters for each manual approval.'); return; }
    setBusy(orderId); setError('');
    try { await request(`/payments/admin/approve?orderId=${encodeURIComponent(orderId)}`, { method: 'POST', body: JSON.stringify({ reason: reason[orderId] }) }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not approve this order.'); }
    finally { setBusy(''); }
  };

  return <main className="min-h-screen bg-surface pt-28 pb-16 px-4 sm:px-8"><div className="max-w-7xl mx-auto">
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8"><div><p className="text-label-sm uppercase tracking-widest text-primary">Tempo · Admin</p><h1 className="font-display text-4xl mt-2">Payment orders</h1><p className="text-sm text-on-surface-variant mt-2">Only sanitized order details are shown here. Payment references remain internal.</p></div>
      <div className="flex gap-2"><Button variant="secondary" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/>Refresh</Button><Button onClick={processInbox} disabled={busy === 'inbox'}>{busy === 'inbox' ? <LoaderCircle size={16} className="animate-spin"/> : null}Process Gmail inbox</Button></div></div>
    {error && <div role="alert" className="mb-5 rounded-xl border border-error/30 bg-error-container/30 p-4 text-sm text-error">{error}</div>}
    <div className="flex flex-wrap gap-2 mb-5">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-xs font-semibold ${filter === item ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>{item.replace('_', ' ')}</button>)}</div>
    {unmatched.length > 0 && (filter === 'ALL' || filter === 'MANUAL_REVIEW') && <section className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950"><h2 className="font-semibold">Payment notices needing attention</h2><p className="mt-1 text-sm">These notices were not auto-approved. Review the provider inbox privately; raw messages and payment references are not shown here.</p><ul className="mt-3 space-y-2">{unmatched.map((item, index) => <li key={`${item.processedAt}-${index}`} className="flex flex-wrap justify-between gap-2 text-sm"><span>{item.orderId ? `Order ${item.orderId} · ` : ''}{item.amount == null ? 'Amount could not be parsed' : `₹${item.amount.toFixed(2)}`}</span><span>{new Date(item.processedAt).toLocaleString()} · {item.status}</span></li>)}</ul></section>}
    <div className="overflow-x-auto rounded-2xl border border-outline-variant/40 bg-surface-container-lowest"><table className="min-w-[880px] w-full text-sm"><thead><tr className="text-left bg-surface-container-low text-on-surface-variant"><th className="p-4">Order ID</th><th className="p-4">Customer</th><th className="p-4">Product</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Created</th><th className="p-4">Paid</th></tr></thead><tbody>
      {orders.map((order) => <tr key={order.orderId} className="border-t border-surface-container align-top"><td className="p-4 font-mono text-xs">{order.orderId}</td><td className="p-4"><div>{order.customer}</div><div className="mt-1 text-xs text-on-surface-variant">{order.email}</div></td><td className="p-4">{order.product}</td><td className="p-4">₹{order.amount.toFixed(2)}</td><td className="p-4"><span className="rounded-full bg-surface-container px-2.5 py-1 text-xs font-semibold">{order.status}</span>{order.status === 'MANUAL_REVIEW' && <div className="mt-3 min-w-52"><textarea value={reason[order.orderId] || ''} onChange={(event) => setReason((prev) => ({ ...prev, [order.orderId]: event.target.value }))} maxLength={500} rows={2} placeholder="Manual review reason" className="w-full rounded-lg border border-outline-variant/50 bg-white p-2 text-xs"/><Button size="sm" className="mt-1 w-full" onClick={() => approve(order.orderId)} disabled={busy === order.orderId}>{busy === order.orderId ? 'Approving…' : 'Approve payment'}</Button></div>}</td><td className="p-4 whitespace-nowrap">{new Date(order.createdAt).toLocaleString()}</td><td className="p-4 whitespace-nowrap">{order.paidAt ? new Date(order.paidAt).toLocaleString() : '—'}</td></tr>)}
      {!loading && orders.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-on-surface-variant">No orders found for this filter.</td></tr>}
      {loading && <tr><td colSpan={7} className="p-12 text-center text-on-surface-variant">Loading payment orders…</td></tr>}
    </tbody></table></div>
  </div></main>;
};
