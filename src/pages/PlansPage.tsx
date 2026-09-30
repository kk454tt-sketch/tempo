import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Copy, LoaderCircle, LockKeyhole, X } from 'lucide-react';
import QRCode from 'qrcode';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';

type Product = { id: string; name: string; description: string; amount: number; currency: string };
type Order = { orderId: string; customerName: string; productName: string; websiteId: string; amount: number; currency: string; status: string; productStatus: string; upiUri: string; expiresAt: string };
type Website = { id: string; title: string; slug: string; status: string; proInteractiveEnabled: boolean };

export const PlansPage = () => {
  const { user, session } = useAuth();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [websiteId, setWebsiteId] = useState(searchParams.get('websiteId') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [qrImage, setQrImage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const request = async (path: string, init: RequestInit = {}) => {
    if (!session?.access_token) throw new Error('Secure checkout requires a verified Supabase account. Please sign in after configuring Supabase authentication.');
    const response = await fetch(`/api${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, ...(init.headers || {}) } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not complete the request.');
    return data;
  };

  useEffect(() => {
    if (!session?.access_token) { setError('Sign in with your Tempo account to load the Pro Interactive checkout.'); return; }
    Promise.all([request('/payments/products'), request('/payments/websites')])
      .then(([productData, websiteData]) => {
        setProducts(productData.products);
        setWebsites(websiteData.websites);
        const requested = searchParams.get('websiteId');
        const eligible = websiteData.websites.find((site: Website) => site.id === requested && !site.proInteractiveEnabled)
          || websiteData.websites.find((site: Website) => !site.proInteractiveEnabled);
        setWebsiteId(eligible?.id || '');
      })
      .catch((e) => setError(e.message));
  }, [session?.access_token]);
  useEffect(() => {
    let active = true;
    setQrImage('');
    if (order?.upiUri) QRCode.toDataURL(order.upiUri, { errorCorrectionLevel: 'M', margin: 2, width: 360 })
      .then((image) => { if (active) setQrImage(image); })
      .catch(() => { if (active) setError('The payment QR could not be generated. Use the UPI app link or the backup QR.'); });
    return () => { active = false; };
  }, [order?.upiUri]);
  useEffect(() => {
    if (!order || !session?.access_token || ['PAID', 'FAILED', 'EXPIRED', 'MANUAL_REVIEW'].includes(order.status)) return;
    const timer = window.setInterval(() => request(`/payments/order-status?orderId=${encodeURIComponent(order.orderId)}`).then((data) => setOrder(data.order)).catch(() => {}), 5000);
    return () => window.clearInterval(timer);
  }, [order?.orderId, order?.status, session?.access_token]);

  const buy = async (productId: string) => {
    if (!websiteId) { setError('Create or select a Pro Interactive website first.'); return; }
    setBusy(true); setError('');
    try { const data = await request('/payments/orders', { method: 'POST', body: JSON.stringify({ productId, websiteId }) }); setOrder(data.order); }
    catch (e) { setError(e instanceof Error ? e.message : 'Checkout could not start.'); }
    finally { setBusy(false); }
  };

  const claimPaid = async () => {
    if (!order) return;
    setBusy(true); setError('');
    try { const data = await request(`/payments/claim-payment?orderId=${encodeURIComponent(order.orderId)}`, { method: 'POST', body: '{}' }); setOrder(data.order); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not update payment status.'); }
    finally { setBusy(false); }
  };

  const copyUpi = async () => {
    if (!order) return;
    const upi = new URL(order.upiUri).searchParams.get('pa') || '';
    await navigator.clipboard.writeText(upi); setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  };

  const orderUpiId = order ? new URL(order.upiUri).searchParams.get('pa') || '' : '';

  return <main className="min-h-screen bg-surface pt-28 pb-20 px-4 sm:px-8">
    <div className="max-w-6xl mx-auto">
      <Link to="/" className="text-sm text-primary hover:underline">← Back to Tempo</Link>
      <div className="text-center max-w-2xl mx-auto mt-10 mb-12">
        <span className="text-label-sm uppercase tracking-[.2em] text-primary font-semibold">Simple one-time upgrades</span>
        <h1 className="font-display text-4xl sm:text-5xl text-on-surface mt-3">Unlock Pro Interactive</h1>
        <p className="text-on-surface-variant mt-4">One-time ₹499 upgrade for a Pro Interactive website. The selected site unlocks only after backend payment verification.</p>
        {user && <p className="text-xs text-on-surface-variant mt-3">Signed in as {user.email}</p>}
        {!session?.access_token && <Link to="/login?from=/plans" className="inline-flex mt-5 rounded-xl bg-primary px-5 py-3 font-semibold text-white">Sign in to continue</Link>}
      </div>
      {error && <div role="alert" className="max-w-2xl mx-auto mb-6 rounded-xl border border-error/30 bg-error-container/30 p-4 text-sm text-error">{error}</div>}
      {products.length > 0 && <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {products.map((product) => <article key={product.id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 p-7 sm:p-9 shadow-sm flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center"><LockKeyhole size={22}/></div>
          <h2 className="font-display text-2xl mt-5">{product.name}</h2><p className="text-on-surface-variant mt-2 min-h-12">{product.description}</p>
          <div className="text-4xl font-semibold mt-7">₹{product.amount.toFixed(0)} <span className="text-sm font-normal text-on-surface-variant">one-time</span></div>
          <div className="mt-6 flex items-center gap-2 text-sm text-on-surface-variant"><Check size={16} className="text-primary"/>Automatic access after payment verification</div>
          {websites.filter((site) => !site.proInteractiveEnabled).length > 0 ? <label className="mt-6 block text-sm font-medium">Choose your Pro Interactive website
            <select value={websiteId} onChange={(event) => setWebsiteId(event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-3 py-3 text-on-surface">
              {websites.filter((site) => !site.proInteractiveEnabled).map((site) => <option key={site.id} value={site.id}>{site.title} · /e/{site.slug}</option>)}
            </select>
          </label> : <p className="mt-6 text-sm text-on-surface-variant">Create a Pro Interactive website in the editor before purchasing this upgrade. <Link className="text-primary font-semibold underline" to="/create/enrolldesk-01">Create one now</Link></p>}
          <Button className="mt-8 w-full" onClick={() => buy(product.id)} disabled={busy || !websiteId || !websites.some((site) => site.id === websiteId && !site.proInteractiveEnabled)}>{busy ? <LoaderCircle className="animate-spin" size={18}/> : <>Continue to UPI <ArrowRight size={17}/></>}</Button>
        </article>)}
      </div>}
      {products.length === 0 && !error && <div className="text-center text-on-surface-variant">Loading upgrades…</div>}
    </div>

    {order && <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="payment-title">
      <section className="w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-3xl bg-surface-container-lowest shadow-2xl border border-outline-variant/40">
        <header className="p-5 sm:p-7 border-b border-surface-container flex justify-between items-start"><div><p className="text-label-sm uppercase tracking-widest text-primary">Secure UPI checkout</p><h2 id="payment-title" className="font-display text-2xl mt-1">{order.status === 'PAID' ? 'Payment confirmed' : `Unlock ${order.productName}`}</h2></div><button aria-label="Close payment panel" onClick={() => setOrder(null)} className="p-2 rounded-full hover:bg-surface-container"><X size={20}/></button></header>
        <div className="p-5 sm:p-7 space-y-5">
          <div className="flex justify-between gap-4"><span className="text-on-surface-variant">Amount</span><strong>₹{order.amount.toFixed(2)}</strong></div>
          <div className="flex justify-between gap-4"><span className="text-on-surface-variant">Customer</span><strong>{order.customerName}</strong></div>
          <div className="flex justify-between gap-4 text-sm"><span className="text-on-surface-variant">Order ID</span><span className="font-mono">{order.orderId}</span></div>
          <div className="rounded-2xl bg-surface-container-low p-5 text-center">
            <p className="font-semibold">Scan this QR with any UPI app</p>
            {qrImage ? <img src={qrImage} alt={`UPI QR for ${order.productName}, ₹${order.amount.toFixed(2)}, order ${order.orderId}`} className="w-full max-w-[280px] aspect-square object-contain mx-auto my-4 rounded-xl border border-outline-variant/40 bg-white p-2" /> : <div className="mx-auto my-4 size-[280px] rounded-xl bg-white flex items-center justify-center text-sm text-on-surface-variant">Generating secure order QR…</div>}
            <p className="text-xs text-on-surface-variant">Confirm the payee name and ₹{order.amount.toFixed(2)} amount in your UPI app before paying.</p>
            <p className="mt-3 font-mono text-sm font-semibold">{orderUpiId}</p>
            <a href={order.upiUri} className="mt-4 inline-flex w-full justify-center items-center gap-2 rounded-xl bg-primary text-white font-semibold py-3 px-4 hover:opacity-90">Pay via UPI App <ArrowRight size={17}/></a>
            <button onClick={copyUpi} className="mt-3 inline-flex items-center gap-2 text-sm text-primary">{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'UPI ID copied' : 'Copy UPI ID'}</button>
            <details className="mt-4 text-left"><summary className="cursor-pointer text-xs text-on-surface-variant">Show your backup FamApp QR</summary><img src="/upi-payment.gif" alt="Backup FamApp QR for Jaisingh Kushwaha" className="w-full max-w-[240px] mx-auto mt-3 rounded-xl"/><p className="mt-2 text-center text-xs text-on-surface-variant">This backup QR may not include this order’s reference. Prefer the order QR above.</p></details>
          </div>
          <p className="text-sm text-on-surface-variant">After paying, return here and tap “I have paid”. That only starts a verification check; your product stays locked until the payment is verified.</p>
          {order.status === 'PAID' ? <div className="rounded-xl bg-emerald-50 text-emerald-800 p-4"><strong>Payment successful ✓</strong><p className="text-sm mt-1">{order.productName} is approved and available.</p><Link to={`/dashboard/websites/${encodeURIComponent(order.websiteId)}/edit`} className="inline-flex mt-4 items-center gap-2 font-semibold underline">Continue editing your site <ArrowRight size={16}/></Link></div>
            : order.status === 'MANUAL_REVIEW' ? <div className="rounded-xl bg-amber-50 text-amber-900 p-4 text-sm">Your payment needs a manual review. Your product will unlock after approval.</div>
            : order.status === 'EXPIRED' || order.status === 'FAILED' ? <div className="rounded-xl bg-amber-50 text-amber-900 p-4 text-sm">This order has expired. Start a new checkout to pay.</div>
            : <><div className="text-sm rounded-xl border border-outline-variant/40 px-4 py-3">Payment status: <strong>{order.status === 'VERIFYING' ? 'Checking payment…' : 'Waiting for payment…'}</strong>{order.status === 'VERIFYING' && <p className="mt-1 text-xs text-on-surface-variant">FamApp inbox checks run automatically. This can take up to five minutes.</p>}</div><Button className="w-full" onClick={claimPaid} disabled={busy || order.status !== 'PENDING'}>{busy ? 'Checking…' : 'I have paid'}</Button></>}
        </div>
      </section>
    </div>}
  </main>;
};
