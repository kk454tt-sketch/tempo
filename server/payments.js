import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Vite serves the local API during development. Vercel uses its own server environment.
try {
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
} catch { /* Environment variables are configured by the host in production. */ }

const env = (key, fallback = '') => process.env[key] || fallback;
const config = {
  supabaseUrl: env('SUPABASE_URL', env('VITE_SUPABASE_URL')),
  anonKey: env('SUPABASE_ANON_KEY', env('VITE_SUPABASE_ANON_KEY')),
  serviceKey: env('SUPABASE_SERVICE_ROLE_KEY'),
  upiId: env('UPI_ID', '9979370684@fam'),
  merchant: env('UPI_MERCHANT_NAME', 'Jaisingh Kushwaha'),
};
let adminClient;

function db() {
  if (!config.supabaseUrl || !config.serviceKey) throw new Error('Persistent payment storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.');
  if (!adminClient) adminClient = createClient(config.supabaseUrl, config.serviceKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  return adminClient;
}

export async function authenticate(req) {
  const accessToken = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken || !config.supabaseUrl || !config.anonKey) return null;
  const { data, error } = await db().auth.getUser(accessToken);
  if (error || !data.user?.id || !data.user.email || !data.user.email_confirmed_at) return null;
  return { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email.split('@')[0] };
}

function safeOrder(row) {
  const payment = new URLSearchParams({ pa: config.upiId, pn: config.merchant, am: (row.amount_paise / 100).toFixed(2), cu: 'INR', tn: row.order_id });
  return {
    orderId: row.order_id,
    customerName: row.customer_name || '',
    productId: row.product_id,
    productName: row.product_name,
    websiteId: row.website_id,
    amount: row.amount_paise / 100,
    currency: row.currency,
    status: row.payment_status,
    productStatus: row.product_status,
    upiUri: `upi://pay?${payment}`,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

export async function getProducts() {
  const { data, error } = await db().from('payment_products').select('id,name,description,amount_paise,currency').eq('active', true).not('amount_paise', 'is', null).order('amount_paise');
  if (error) throw error;
  return (data || []).map((item) => ({ id: item.id, name: item.name, description: item.description, amount: item.amount_paise / 100, currency: item.currency }));
}

export async function getOwnedWebsites(userId) {
  const { data, error } = await db().from('event_websites').select('id,title,slug,is_lifetime,pro_interactive_enabled,status').eq('user_id', userId).eq('template_id', 'enrolldesk-01').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((site) => ({ id: site.id, title: site.title, slug: site.slug, status: site.status, proInteractiveEnabled: Boolean(site.pro_interactive_enabled) }));
}

export async function createOrder(user, websiteId) {
  const { data, error } = await db().rpc('create_pro_interactive_order', { p_user_id: user.id, p_customer_name: user.name, p_customer_email: user.email, p_website_id: websiteId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? safeOrder({
    order_id: row.public_order_id, customer_name: user.name, product_id: row.product_uuid, product_name: row.product_name,
    website_id: row.website_uuid, amount_paise: row.amount_paise, currency: 'INR',
    payment_status: row.payment_status, product_status: row.product_status, created_at: row.created_at, expires_at: row.expires_at,
  }) : null;
}

export async function getOwnedOrder(orderId, userId) {
  const client = db();
  const { data, error } = await client.from('payment_orders').select('order_id,customer_name,product_id,product_name,website_id,amount_paise,currency,payment_status,product_status,created_at,expires_at,user_id').eq('order_id', orderId.toUpperCase()).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (['PENDING', 'VERIFYING'].includes(data.payment_status) && new Date(data.expires_at) <= new Date()) {
    await client.from('payment_orders').update({ payment_status: 'EXPIRED' }).eq('order_id', data.order_id).eq('user_id', userId).in('payment_status', ['PENDING', 'VERIFYING']);
    data.payment_status = 'EXPIRED';
  }
  return safeOrder(data);
}

export async function submitPaymentClaim(orderId, userId) {
  const { data, error } = await db().rpc('claim_pro_interactive_payment', { p_order_id: orderId, p_user_id: userId });
  if (error) throw error;
  return getOwnedOrder(orderId, userId);
}

export async function getWebsiteAccess(websiteId, userId) {
  const { data, error } = await db().from('event_websites').select('id,status,pro_interactive_enabled').eq('id', websiteId).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data?.pro_interactive_enabled) return false;
  // Already-published sites were grandfathered by the migration; drafts need an approved paid order.
  if (data.status === 'published') return true;
  const { data: paidOrders, error: orderError } = await db().from('payment_orders').select('id').eq('website_id', websiteId).eq('user_id', userId).eq('product_id', 'pro-interactive').eq('payment_status', 'PAID').eq('product_status', 'APPROVED').limit(1);
  if (orderError) throw orderError;
  return Boolean(paidOrders?.length);
}

function decodePart(data = '') {
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function extractText(payload) {
  const parts = [];
  const walk = (part) => {
    if (part.body?.data && ['text/plain', 'text/html'].includes(part.mimeType)) parts.push(decodePart(part.body.data));
    for (const child of part.parts || []) walk(child);
  };
  walk(payload);
  return parts.join('\n').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&#8377;|&rupee;/gi, '₹').replace(/\s+/g, ' ');
}

function extractPayment(text) {
  const lower = text.toLowerCase();
  if (/(debited|sent from|paid to|withdrawn)/i.test(lower) && !/(received|credited)/i.test(lower)) return null;
  const amountMatch = text.match(/(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i) || text.match(/([\d,]+(?:\.\d{1,2})?)\s*(?:INR|Rs\.?|₹)/i);
  const transactionMatch = text.match(/(?:UTR|UPI\s*(?:ref(?:erence)?|transaction)(?:\s*(?:ID|no\.?|number))?|transaction\s*(?:ID|reference|no\.?|number)|reference\s*(?:ID|no\.?|number))\s*[:#\-]?\s*([A-Z0-9]{8,32})/i);
  const orderMatch = text.match(/ORD-\d{8}-[A-Z0-9]{12}/i);
  const dateMatch = text.match(/\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?\b/);
  if (!amountMatch) return null;
  return {
    amountPaise: Math.round(Number(amountMatch[1].replaceAll(',', '')) * 100),
    reference: transactionMatch?.[1]?.toUpperCase() || null,
    orderId: orderMatch?.[0]?.toUpperCase() || null,
    paymentTime: dateMatch && !Number.isNaN(new Date(dateMatch[0]).getTime()) ? new Date(dateMatch[0]).toISOString() : null,
  };
}

async function getGmailAccessToken() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) throw new Error('Gmail OAuth is not configured on the server.');
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, refresh_token: GMAIL_REFRESH_TOKEN, grant_type: 'refresh_token' }) });
  if (!response.ok) throw new Error('Gmail OAuth token refresh failed. Check the refresh token and Gmail OAuth grant.');
  return (await response.json()).access_token;
}

function headerValue(message, name) {
  return message.payload?.headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value || '';
}

async function sendGmail(to, subject, plainText) {
  if (process.env.GMAIL_SEND_ENABLED !== 'true') return;
  const token = await getGmailAccessToken();
  const safeTo = String(to).replace(/[\r\n]/g, '');
  const safeSubject = String(subject).replace(/[\r\n]/g, '');
  const raw = `To: ${safeTo}\r\nSubject: ${safeSubject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${plainText}`;
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ raw: Buffer.from(raw).toString('base64url') }) });
  if (!response.ok) throw new Error('Could not send the sanitized payment notification.');
}

function cleanName(value) { return String(value || 'Customer').replace(/[\r\n]/g, '').slice(0, 100); }
function paymentText(row) {
  const baseUrl = env('PUBLIC_SITE_URL').replace(/\/$/, '');
  const accessUrl = baseUrl ? `${baseUrl}/dashboard/websites/${encodeURIComponent(row.website_id)}/edit` : 'Sign in to your account to open your website.';
  return `PAYMENT SUCCESSFUL\n\nHello ${cleanName(row.customer_name)},\n\nYour payment has been successfully verified.\n\nProduct: ${row.product_name}\nAmount: ₹${(row.amount_paise / 100).toFixed(2)}\nOrder ID: ${row.order_id}\nStatus: PAID\n\nYour product is now available.\nAccess Product: ${accessUrl}`;
}
async function sendReviewNotification(row) {
  if (process.env.GMAIL_SEND_ENABLED !== 'true' || !process.env.ADMIN_EMAIL) return;
  const body = `PAYMENT NEEDS REVIEW\n\nCustomer: ${cleanName(row.customer_name)}\nProduct: ${row.product_name}\nAmount: ₹${(row.amount_paise / 100).toFixed(2)}\nOrder ID: ${row.order_id}\nStatus: MANUAL_REVIEW\nTime: ${new Date().toISOString()}`;
  await sendGmail(process.env.ADMIN_EMAIL, `Payment needs review — ${row.order_id}`, body);
}
async function sendUnmatchedNotification(amountPaise) {
  if (process.env.GMAIL_SEND_ENABLED !== 'true' || !process.env.ADMIN_EMAIL) return;
  const amount = Number.isInteger(amountPaise) ? `\nAmount: ₹${(amountPaise / 100).toFixed(2)}` : '';
  await sendGmail(process.env.ADMIN_EMAIL, 'UPI payment notice needs review', `PAYMENT NEEDS REVIEW\n\nAn incoming FamApp payment notice could not be safely approved.${amount}\nStatus: MANUAL_REVIEW\nTime: ${new Date().toISOString()}\n\nReview the payment inbox and admin payment dashboard. This event granted no additional product access.`);
}

export async function processGmailPayments() {
  const trustedSender = env('GMAIL_PAYMENT_SENDER').trim().toLowerCase();
  if (!trustedSender || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(trustedSender)) {
    throw new Error('Set GMAIL_PAYMENT_SENDER to the exact FamApp payment-notification email address before enabling automatic verification.');
  }
  const client = db();
  const { data: acquired, error: lockError } = await client.rpc('acquire_payment_scan_lock', { p_lease_seconds: 55 });
  if (lockError) throw lockError;
  if (!acquired) return { configured: true, processed: 0, busy: true };

  const token = await getGmailAccessToken();
  const query = env('GMAIL_PAYMENT_QUERY', 'from:(famapp) newer_than:30d');
  const { data: scanState } = await client.from('payment_scan_lock').select('gmail_next_page_token').eq('id', true).single();
  const pageToken = scanState?.gmail_next_page_token;
  let listResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!listResponse.ok && pageToken) {
    await client.from('payment_scan_lock').update({ gmail_next_page_token: null }).eq('id', true);
    listResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`, { headers: { Authorization: `Bearer ${token}` } });
  }
  if (!listResponse.ok) throw new Error('Gmail messages could not be read. Check Gmail API enablement and OAuth read scope.');
  const listed = await listResponse.json();
  let processed = 0;

  for (const message of listed.messages || []) {
    const { data: already } = await client.from('processed_payment_notifications').select('gmail_message_id').eq('gmail_message_id', message.id).maybeSingle();
    if (already) continue;
    const messageResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(message.id)}?format=full`, { headers: { Authorization: `Bearer ${token}` } });
    if (!messageResponse.ok) continue;
    const full = await messageResponse.json();
    const senderHeader = headerValue(full, 'from');
    const sender = senderHeader.match(/<([^<>]+)>/)?.[1]?.trim().toLowerCase() || senderHeader.trim().toLowerCase();
    if (sender !== trustedSender) {
      await client.from('processed_payment_notifications').insert({ gmail_message_id: message.id, outcome: 'IGNORED' });
      continue;
    }
    const info = extractPayment(extractText(full.payload || {}));
    if (!info) {
      await client.from('processed_payment_notifications').insert({ gmail_message_id: message.id, outcome: 'UNKNOWN' });
      try { await sendUnmatchedNotification(null); } catch (error) { console.error('[Admin payment notice email failed]', error.message); }
      continue;
    }
    const { data: result, error } = await client.rpc('verify_upi_payment', {
      p_gmail_message_id: message.id,
      p_order_id: info.orderId,
      p_transaction_reference: info.reference,
      p_amount_paise: info.amountPaise,
      p_payment_time: info.paymentTime,
    });
    if (error) throw error;
    const outcome = Array.isArray(result) ? result[0] : result;
    if (outcome?.outcome === 'UNKNOWN' || outcome?.outcome === 'DUPLICATE') {
      try { await sendUnmatchedNotification(outcome.amount_paise); } catch (error) { console.error('[Admin payment notice email failed]', error.message); }
    }
    processed++;
  }
  await client.from('payment_scan_lock').update({ gmail_next_page_token: listed.nextPageToken || null }).eq('id', true);
  await client.rpc('expire_pro_interactive_orders');
  const notificationsSent = await deliverPendingNotifications();
  return { configured: true, processed, notificationsSent, hasMore: Boolean(listed.nextPageToken) };
}

export async function deliverPendingNotifications() {
  if (process.env.GMAIL_SEND_ENABLED !== 'true') return 0;
  const client = db();
  const { data: pending, error } = await client.from('payment_notification_outbox').select('id,order_id,recipient_type,attempts').eq('delivery_status', 'PENDING').order('created_at').limit(20);
  if (error) throw error;
  let sent = 0;
  for (const notice of pending || []) {
    const { data: row, error: orderError } = await client.from('payment_orders').select('order_id,customer_name,customer_email,product_name,website_id,amount_paise,payment_status').eq('id', notice.order_id).maybeSingle();
    if (orderError || !row) continue;
    let recipient = notice.recipient_type === 'customer' ? row.customer_email : process.env.ADMIN_EMAIL;
    if (!recipient) continue;
    try {
      if (notice.recipient_type === 'admin' && row.payment_status === 'MANUAL_REVIEW') {
        await sendReviewNotification(row);
      } else if (row.payment_status === 'PAID') {
        if (notice.recipient_type === 'customer') await sendGmail(recipient, `Payment successful — ${row.order_id}`, paymentText(row));
        else await sendGmail(recipient, `Payment verified — ${row.order_id}`, `PAYMENT VERIFIED\n\nCustomer: ${cleanName(row.customer_name)}\nProduct: ${row.product_name}\nAmount: ₹${(row.amount_paise / 100).toFixed(2)}\nOrder ID: ${row.order_id}\nStatus: PAID\nTime: ${new Date().toISOString()}`);
      } else {
        continue;
      }
    } catch (deliveryError) {
      await client.from('payment_notification_outbox').update({ attempts: notice.attempts + 1 }).eq('id', notice.id).eq('delivery_status', 'PENDING');
      console.error('[Sanitized payment email delivery failed]', deliveryError.message);
      continue;
    }
    const { error: sentError } = await client.from('payment_notification_outbox').update({ delivery_status: 'SENT', attempts: notice.attempts + 1, sent_at: new Date().toISOString() }).eq('id', notice.id).eq('delivery_status', 'PENDING');
    if (!sentError) sent++;
  }
  return sent;
}

export async function listAdminOrders(status) {
  const allowed = ['PENDING','VERIFYING','PAID','FAILED','EXPIRED','MANUAL_REVIEW'];
  let query = db().from('payment_orders').select('order_id,customer_name,customer_email,product_name,amount_paise,payment_status,created_at,paid_at').order('created_at', { ascending: false }).limit(200);
  if (allowed.includes(status)) query = query.eq('payment_status', status);
  const { data, error } = await query;
  if (error) throw error;
  const { data: unmatched, error: unmatchedError } = await db().from('processed_payment_notifications').select('amount_paise,processed_at,outcome,order_id').in('outcome', ['UNKNOWN','REVIEW','DUPLICATE']).order('processed_at', { ascending: false }).limit(50);
  if (unmatchedError) throw unmatchedError;
  const relatedOrderIds = [...new Set((unmatched || []).map((row) => row.order_id).filter(Boolean))];
  let publicOrderIds = new Map();
  if (relatedOrderIds.length) {
    const { data: related, error: relatedError } = await db().from('payment_orders').select('id,order_id').in('id', relatedOrderIds);
    if (relatedError) throw relatedError;
    publicOrderIds = new Map((related || []).map((row) => [row.id, row.order_id]));
  }
  return {
    orders: (data || []).map((row) => ({ orderId: row.order_id, customer: row.customer_name, email: row.customer_email, product: row.product_name, amount: row.amount_paise / 100, status: row.payment_status, createdAt: row.created_at, paidAt: row.paid_at })),
    unmatchedPayments: (unmatched || []).map((row) => ({ orderId: publicOrderIds.get(row.order_id) || null, amount: Number.isInteger(row.amount_paise) ? row.amount_paise / 100 : null, processedAt: row.processed_at, status: row.outcome === 'DUPLICATE' ? 'DUPLICATE' : 'MANUAL_REVIEW' })),
  };
}

export async function approveManualOrder(orderId, adminId, reason) {
  const { data, error } = await db().rpc('approve_payment_manually', { p_order_id: orderId, p_admin_id: adminId, p_reason: reason });
  if (error) throw error;
  if (!data) return null;
  const { data: dbOrder, error: orderError } = await db().from('payment_orders').select('id,order_id,customer_name,customer_email,product_name,amount_paise,payment_status').eq('order_id', orderId.toUpperCase()).single();
  if (orderError) throw orderError;
  await deliverPendingNotifications();
  return { orderId: dbOrder.order_id, status: dbOrder.payment_status, productStatus: 'APPROVED' };
}

export async function isAdmin(user) {
  return Boolean(user?.email && process.env.ADMIN_EMAIL && user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());
}

export async function createCronAuthorization(req) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && req.headers.authorization === `Bearer ${secret}`);
}
