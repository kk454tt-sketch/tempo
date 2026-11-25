import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { adminAuth, adminDb, FieldValue } from './firebaseAdmin.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Vite serves the local API during development. Vercel uses its own server environment.
try {
  const envPath = path.join(root, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
} catch { /* Environment variables are configured by the host in production. */ }

const env = (key, fallback = '') => process.env[key] || fallback;
const config = {
  upiId: env('UPI_ID', '9979370684@fam'),
  merchant: env('UPI_MERCHANT_NAME', 'Jaisingh Kushwaha'),
};

export async function authenticate(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      id: decodedToken.uid,
      email: (decodedToken.email || `${decodedToken.uid}@tempo.user`).toLowerCase().trim(),
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Customer',
    };
  } catch (err) {
    console.warn('[Payments Auth] ID token verification failed:', err.message);
    return null;
  }
}

function safeOrder(row) {
  const amountNumber = (row.amount_paise || 49900) / 100;
  const payment = new URLSearchParams({
    pa: config.upiId,
    pn: config.merchant,
    am: amountNumber.toFixed(2),
    cu: 'INR',
    tn: row.order_id,
  });

  return {
    orderId: row.order_id,
    customerName: row.customer_name || '',
    productId: row.product_id,
    productName: row.product_name,
    websiteId: row.website_id,
    amount: amountNumber,
    currency: row.currency || 'INR',
    status: row.payment_status,
    productStatus: row.product_status,
    upiUri: `upi://pay?${payment}`,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

export async function getProducts() {
  const productsCol = adminDb.collection('paymentProducts');
  let snapshot = await productsCol.where('active', '==', true).get();

  // Seed Pro Interactive default product if not yet in Firestore
  if (snapshot.empty) {
    const defaultProduct = {
      id: 'pro-interactive',
      name: 'Pro Interactive',
      description: 'Unlock the Pro Interactive features for one selected website.',
      amount_paise: 49900,
      currency: 'INR',
      active: true,
      entitlement: 'pro_interactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await productsCol.doc('pro-interactive').set(defaultProduct);
    snapshot = await productsCol.where('active', '==', true).get();
  }

  const products = [];
  snapshot.forEach((doc) => {
    const item = doc.data();
    if (item.amount_paise) {
      products.push({
        id: item.id || doc.id,
        name: item.name,
        description: item.description,
        amount: item.amount_paise / 100,
        currency: item.currency || 'INR',
      });
    }
  });

  return products.sort((a, b) => a.amount - b.amount);
}

export async function getOwnedWebsites(userId) {
  const snapshot = await adminDb
    .collection('websites')
    .where('userId', '==', userId)
    .where('templateId', '==', 'enrolldesk-01')
    .get();

  const sites = [];
  snapshot.forEach((doc) => {
    const s = doc.data();
    sites.push({
      id: s.id || doc.id,
      title: s.title,
      slug: s.slug,
      status: s.status,
      proInteractiveEnabled: Boolean(s.proInteractiveEnabled),
      createdAt: s.createdAt,
    });
  });

  sites.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return sites;
}

export async function createOrder(user, websiteId) {
  const now = new Date();
  const siteRef = adminDb.collection('websites').doc(websiteId);
  const siteSnap = await siteRef.get();

  if (!siteSnap.exists) {
    throw new Error('Choose a Pro Interactive website owned by your account');
  }

  const site = siteSnap.data();
  if (site.userId !== user.id || site.templateId !== 'enrolldesk-01') {
    throw new Error('Choose a Pro Interactive website owned by your account');
  }

  if (site.proInteractiveEnabled) {
    throw new Error('Pro Interactive is already enabled for this website');
  }

  // Check active products
  const productDoc = await adminDb.collection('paymentProducts').doc('pro-interactive').get();
  const product = productDoc.exists ? productDoc.data() : {
    id: 'pro-interactive',
    name: 'Pro Interactive',
    amount_paise: 49900,
  };

  // Check existing unexpired order
  const existingOrders = await adminDb
    .collection('paymentOrders')
    .where('website_id', '==', websiteId)
    .where('user_id', '==', user.id)
    .where('product_id', '==', 'pro-interactive')
    .get();

  for (const doc of existingOrders.docs) {
    const o = doc.data();
    if (['PENDING', 'VERIFYING'].includes(o.payment_status)) {
      if (new Date(o.expires_at) > now) {
        return safeOrder(o);
      } else {
        await doc.ref.update({ payment_status: 'EXPIRED' });
      }
    }
  }

  // Generate new unique order
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(6).toString('hex').toUpperCase();
  const newOrderId = `ORD-${dateStr}-${randomHex}`;
  const expiresAt = new Date(now.getTime() + 20 * 60 * 1000); // 20 minutes

  const newOrderData = {
    id: newOrderId,
    order_id: newOrderId,
    user_id: user.id,
    customer_name: user.name || user.email.split('@')[0],
    customer_email: user.email,
    website_id: websiteId,
    product_id: product.id,
    product_name: product.name,
    amount_paise: product.amount_paise,
    currency: 'INR',
    payment_status: 'PENDING',
    product_status: 'LOCKED',
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  };

  await adminDb.collection('paymentOrders').doc(newOrderId).set(newOrderData);
  return safeOrder(newOrderData);
}

export async function getOwnedOrder(orderId, userId) {
  const cleanId = orderId.toUpperCase().trim();
  const orderRef = adminDb.collection('paymentOrders').doc(cleanId);
  let snap = await orderRef.get();

  if (!snap.exists) {
    // Try query by order_id field
    const q = await adminDb.collection('paymentOrders').where('order_id', '==', cleanId).limit(1).get();
    if (q.empty) return null;
    snap = q.docs[0];
  }

  const data = snap.data();
  if (data.user_id !== userId) return null;

  if (['PENDING', 'VERIFYING'].includes(data.payment_status) && new Date(data.expires_at) <= new Date()) {
    await snap.ref.update({ payment_status: 'EXPIRED' });
    data.payment_status = 'EXPIRED';
  }

  return safeOrder(data);
}

export async function submitPaymentClaim(orderId, userId) {
  const cleanId = orderId.toUpperCase().trim();
  let snap = await adminDb.collection('paymentOrders').doc(cleanId).get();

  if (!snap.exists) {
    const q = await adminDb.collection('paymentOrders').where('order_id', '==', cleanId).limit(1).get();
    if (q.empty) return null;
    snap = q.docs[0];
  }

  const data = snap.data();
  if (data.user_id !== userId) return null;

  const now = new Date();
  if (data.payment_status === 'PENDING') {
    const newStatus = new Date(data.expires_at) <= now ? 'EXPIRED' : 'VERIFYING';
    await snap.ref.update({ payment_status: newStatus });
    data.payment_status = newStatus;
  }

  return safeOrder(data);
}

export async function getWebsiteAccess(websiteId, userId) {
  const siteSnap = await adminDb.collection('websites').doc(websiteId).get();
  if (!siteSnap.exists) return false;

  const data = siteSnap.data();
  if (data.userId !== userId) return false;
  if (data.proInteractiveEnabled) return true;
  if (data.status === 'published') return true; // Grandfathered published EnrollDesk sites

  const paidOrdersSnap = await adminDb
    .collection('paymentOrders')
    .where('website_id', '==', websiteId)
    .where('user_id', '==', userId)
    .where('product_id', '==', 'pro-interactive')
    .where('payment_status', '==', 'PAID')
    .where('product_status', '==', 'APPROVED')
    .limit(1)
    .get();

  return !paidOrdersSnap.empty;
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

  // Acquire distributed scan lock in Firestore
  const lockRef = adminDb.collection('paymentScanLock').doc('lock');
  const now = new Date();
  const leaseSeconds = 55;

  let acquired = false;
  let pageToken = null;

  await adminDb.runTransaction(async (t) => {
    const lockSnap = await t.get(lockRef);
    if (lockSnap.exists) {
      const data = lockSnap.data();
      const lockedUntil = new Date(data.locked_until || 0);
      if (now < lockedUntil) {
        acquired = false;
        return;
      }
      pageToken = data.gmail_next_page_token || null;
    }
    t.set(
      lockRef,
      {
        locked_until: new Date(now.getTime() + leaseSeconds * 1000).toISOString(),
        updated_at: now.toISOString(),
      },
      { merge: true }
    );
    acquired = true;
  });

  if (!acquired) return { configured: true, processed: 0, busy: true };

  const token = await getGmailAccessToken();
  const query = env('GMAIL_PAYMENT_QUERY', 'from:(famapp) newer_than:30d');
  let listResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!listResponse.ok && pageToken) {
    await lockRef.update({ gmail_next_page_token: null });
    listResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`, { headers: { Authorization: `Bearer ${token}` } });
  }
  if (!listResponse.ok) throw new Error('Gmail messages could not be read. Check Gmail API enablement and OAuth read scope.');
  const listed = await listResponse.json();
  let processed = 0;

  for (const message of listed.messages || []) {
    const processedRef = adminDb.collection('processedPaymentNotifications').doc(message.id);
    const already = await processedRef.get();
    if (already.exists) continue;

    const messageResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(message.id)}?format=full`, { headers: { Authorization: `Bearer ${token}` } });
    if (!messageResponse.ok) continue;
    const full = await messageResponse.json();
    const senderHeader = headerValue(full, 'from');
    const sender = senderHeader.match(/<([^<>]+)>/)?.[1]?.trim().toLowerCase() || senderHeader.trim().toLowerCase();
    
    if (sender !== trustedSender) {
      await processedRef.set({
        gmail_message_id: message.id,
        outcome: 'IGNORED',
        processed_at: new Date().toISOString(),
      });
      continue;
    }

    const info = extractPayment(extractText(full.payload || {}));
    if (!info) {
      await processedRef.set({
        gmail_message_id: message.id,
        outcome: 'UNKNOWN',
        processed_at: new Date().toISOString(),
      });
      try { await sendUnmatchedNotification(null); } catch (error) { console.error('[Admin payment notice email failed]', error.message); }
      continue;
    }

    // Atomic UPI payment verification in Firestore
    let outcome = 'UNKNOWN';
    await adminDb.runTransaction(async (t) => {
      // Find order
      const targetQuery = await adminDb
        .collection('paymentOrders')
        .where('order_id', '==', (info.orderId || '').toUpperCase())
        .limit(1)
        .get();

      if (targetQuery.empty) {
        t.set(processedRef, {
          gmail_message_id: message.id,
          transaction_reference: info.reference,
          amount_paise: info.amountPaise,
          outcome: 'UNKNOWN',
          processed_at: new Date().toISOString(),
        });
        outcome = 'UNKNOWN';
        return;
      }

      const orderDoc = targetQuery.docs[0];
      const target = orderDoc.data();

      // Check duplicate transaction reference
      if (info.reference) {
        const dupQuery = await adminDb
          .collection('paymentTransactions')
          .where('transaction_reference', '==', info.reference)
          .limit(1)
          .get();

        if (!dupQuery.empty) {
          t.set(processedRef, {
            gmail_message_id: message.id,
            transaction_reference: info.reference,
            amount_paise: info.amountPaise,
            order_id: target.order_id,
            outcome: 'DUPLICATE',
            processed_at: new Date().toISOString(),
          });
          outcome = 'DUPLICATE';
          return;
        }
      }

      const isInvalid =
        !info.reference ||
        !['PENDING', 'VERIFYING'].includes(target.payment_status) ||
        target.amount_paise !== info.amountPaise ||
        new Date(target.expires_at) < now;

      if (isInvalid) {
        outcome = 'REVIEW';
        if (target.payment_status !== 'PAID') {
          t.update(orderDoc.ref, {
            payment_status: 'MANUAL_REVIEW',
            product_status: 'LOCKED',
          });
        }
        const txnId = `txn_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        t.set(adminDb.collection('paymentTransactions').doc(txnId), {
          id: txnId,
          order_id: target.order_id,
          transaction_reference: info.reference || `unparsed-${message.id}`,
          amount_paise: info.amountPaise,
          payment_time: info.paymentTime,
          verification_status: 'MANUAL_REVIEW',
          verified_at: new Date().toISOString(),
        });
        t.set(adminDb.collection('paymentNotificationOutbox').doc(`admin_${target.order_id}`), {
          order_id: target.order_id,
          recipient_type: 'admin',
          delivery_status: 'PENDING',
          attempts: 0,
          created_at: new Date().toISOString(),
        });
      } else {
        outcome = 'VERIFIED';
        const txnId = `txn_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        t.set(adminDb.collection('paymentTransactions').doc(txnId), {
          id: txnId,
          order_id: target.order_id,
          transaction_reference: info.reference,
          amount_paise: info.amountPaise,
          payment_time: info.paymentTime,
          verification_status: 'VERIFIED',
          verified_at: new Date().toISOString(),
        });
        t.update(orderDoc.ref, {
          payment_status: 'PAID',
          product_status: 'APPROVED',
          paid_at: new Date().toISOString(),
        });
        // Unlock Pro Interactive on the event website
        t.update(adminDb.collection('websites').doc(target.website_id), {
          proInteractiveEnabled: true,
        });
        t.set(adminDb.collection('paymentNotificationOutbox').doc(`cust_${target.order_id}`), {
          order_id: target.order_id,
          recipient_type: 'customer',
          delivery_status: 'PENDING',
          attempts: 0,
          created_at: new Date().toISOString(),
        });
        t.set(adminDb.collection('paymentNotificationOutbox').doc(`admin_${target.order_id}`), {
          order_id: target.order_id,
          recipient_type: 'admin',
          delivery_status: 'PENDING',
          attempts: 0,
          created_at: new Date().toISOString(),
        });
      }

      t.set(processedRef, {
        gmail_message_id: message.id,
        transaction_reference: info.reference,
        amount_paise: info.amountPaise,
        order_id: target.order_id,
        outcome,
        processed_at: new Date().toISOString(),
      });
    });

    if (outcome === 'UNKNOWN' || outcome === 'DUPLICATE') {
      try { await sendUnmatchedNotification(info?.amountPaise); } catch (error) { console.error('[Admin payment notice email failed]', error.message); }
    }
    processed++;
  }

  await lockRef.update({ gmail_next_page_token: listed.nextPageToken || null });
  
  // Expire overdue orders
  await expireProInteractiveOrders();

  const notificationsSent = await deliverPendingNotifications();
  return { configured: true, processed, notificationsSent, hasMore: Boolean(listed.nextPageToken) };
}

async function expireProInteractiveOrders() {
  const now = new Date();
  const pendingOrders = await adminDb
    .collection('paymentOrders')
    .where('payment_status', 'in', ['PENDING', 'VERIFYING'])
    .get();

  const batch = adminDb.batch();
  let count = 0;
  pendingOrders.forEach((doc) => {
    const o = doc.data();
    if (new Date(o.expires_at) <= now) {
      batch.update(doc.ref, { payment_status: 'EXPIRED' });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
  }
  return count;
}

export async function deliverPendingNotifications() {
  if (process.env.GMAIL_SEND_ENABLED !== 'true') return 0;
  const pendingSnap = await adminDb
    .collection('paymentNotificationOutbox')
    .where('delivery_status', '==', 'PENDING')
    .limit(20)
    .get();

  let sent = 0;
  for (const doc of pendingSnap.docs) {
    const notice = doc.data();
    const orderSnap = await adminDb.collection('paymentOrders').doc(notice.order_id).get();
    if (!orderSnap.exists) continue;
    const row = orderSnap.data();

    const recipient = notice.recipient_type === 'customer' ? row.customer_email : process.env.ADMIN_EMAIL;
    if (!recipient) continue;

    try {
      if (notice.recipient_type === 'admin' && row.payment_status === 'MANUAL_REVIEW') {
        await sendReviewNotification(row);
      } else if (row.payment_status === 'PAID') {
        if (notice.recipient_type === 'customer') {
          await sendGmail(recipient, `Payment successful — ${row.order_id}`, paymentText(row));
        } else {
          await sendGmail(
            recipient,
            `Payment verified — ${row.order_id}`,
            `PAYMENT VERIFIED\n\nCustomer: ${cleanName(row.customer_name)}\nProduct: ${row.product_name}\nAmount: ₹${(row.amount_paise / 100).toFixed(2)}\nOrder ID: ${row.order_id}\nStatus: PAID\nTime: ${new Date().toISOString()}`
          );
        }
      } else {
        continue;
      }
    } catch (deliveryError) {
      await doc.ref.update({ attempts: (notice.attempts || 0) + 1 });
      console.error('[Payment email delivery failed]', deliveryError.message);
      continue;
    }

    await doc.ref.update({
      delivery_status: 'SENT',
      attempts: (notice.attempts || 0) + 1,
      sent_at: new Date().toISOString(),
    });
    sent++;
  }
  return sent;
}

export async function listAdminOrders(status) {
  const allowed = ['PENDING', 'VERIFYING', 'PAID', 'FAILED', 'EXPIRED', 'MANUAL_REVIEW'];
  let query = adminDb.collection('paymentOrders');
  if (allowed.includes(status)) {
    query = query.where('payment_status', '==', status);
  }

  const ordersSnap = await query.get();
  const orders = [];
  ordersSnap.forEach((doc) => {
    const r = doc.data();
    orders.push({
      orderId: r.order_id,
      customer: r.customer_name,
      email: r.customer_email,
      product: r.product_name,
      amount: (r.amount_paise || 49900) / 100,
      status: r.payment_status,
      createdAt: r.created_at,
      paidAt: r.paid_at || null,
    });
  });

  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Unmatched payments
  const unmatchedSnap = await adminDb
    .collection('processedPaymentNotifications')
    .where('outcome', 'in', ['UNKNOWN', 'REVIEW', 'DUPLICATE'])
    .get();

  const unmatched = [];
  unmatchedSnap.forEach((doc) => {
    const r = doc.data();
    unmatched.push({
      orderId: r.order_id || null,
      amount: Number.isInteger(r.amount_paise) ? r.amount_paise / 100 : null,
      processedAt: r.processed_at,
      status: r.outcome === 'DUPLICATE' ? 'DUPLICATE' : 'MANUAL_REVIEW',
    });
  });

  unmatched.sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime());

  return {
    orders: orders.slice(0, 200),
    unmatchedPayments: unmatched.slice(0, 50),
  };
}

export async function approveManualOrder(orderId, adminId, reason) {
  const cleanId = orderId.toUpperCase().trim();
  let snap = await adminDb.collection('paymentOrders').doc(cleanId).get();

  if (!snap.exists) {
    const q = await adminDb.collection('paymentOrders').where('order_id', '==', cleanId).limit(1).get();
    if (q.empty) return null;
    snap = q.docs[0];
  }

  const target = snap.data();
  if (target.payment_status !== 'MANUAL_REVIEW') return null;

  const now = new Date().toISOString();
  await adminDb.runTransaction(async (t) => {
    t.update(snap.ref, {
      payment_status: 'PAID',
      product_status: 'APPROVED',
      paid_at: now,
    });

    const approvalId = `appr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    t.set(adminDb.collection('paymentManualApprovals').doc(approvalId), {
      id: approvalId,
      order_id: target.order_id,
      admin_id: adminId,
      reason: reason.trim(),
      approved_at: now,
    });

    // Unlock website
    t.update(adminDb.collection('websites').doc(target.website_id), {
      proInteractiveEnabled: true,
    });

    t.set(adminDb.collection('paymentNotificationOutbox').doc(`cust_${target.order_id}`), {
      order_id: target.order_id,
      recipient_type: 'customer',
      delivery_status: 'PENDING',
      attempts: 0,
      created_at: now,
    });
    t.set(adminDb.collection('paymentNotificationOutbox').doc(`admin_${target.order_id}`), {
      order_id: target.order_id,
      recipient_type: 'admin',
      delivery_status: 'PENDING',
      attempts: 0,
      created_at: now,
    });
  });

  await deliverPendingNotifications();
  return { orderId: target.order_id, status: 'PAID', productStatus: 'APPROVED' };
}

export async function isAdmin(user) {
  return Boolean(user?.email && process.env.ADMIN_EMAIL && user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());
}

export async function createCronAuthorization(req) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && req.headers.authorization === `Bearer ${secret}`);
}
