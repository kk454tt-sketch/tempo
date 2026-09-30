import {
  authenticate, getProducts, getOwnedWebsites, createOrder, getOwnedOrder,
  submitPaymentClaim, getWebsiteAccess, processGmailPayments, listAdminOrders,
  approveManualOrder, isAdmin, createCronAuthorization,
} from './payments.js';

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function body(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (Buffer.isBuffer(req.body) || typeof req.body === 'string') {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body;
    try { return raw ? JSON.parse(raw) : {}; } catch { throw new Error('Invalid JSON request.'); }
  }
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 8192) reject(new Error('Request body is too large.'));
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON request.')); }
    });
    req.on('error', reject);
  });
}

export async function handlePaymentRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = req.method || 'GET';
  if (method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }

  try {
    if (path === '/api/cron/payments' && method === 'GET') {
      if (!await createCronAuthorization(req)) return send(res, 401, { error: 'Unauthorized.' });
      return send(res, 200, await processGmailPayments());
    }

    if (!path.startsWith('/api/payments/')) return send(res, 404, { error: 'Payment route not found.' });
    const user = await authenticate(req);
    if (!user) return send(res, 401, { error: 'Sign in with your verified account to continue.' });

    if (path === '/api/payments/products' && method === 'GET') return send(res, 200, { products: await getProducts() });
    if (path === '/api/payments/websites' && method === 'GET') return send(res, 200, { websites: await getOwnedWebsites(user.id) });

    if (path === '/api/payments/orders' && method === 'POST') {
      const { websiteId, productId } = await body(req);
      if (productId !== 'pro-interactive' || typeof websiteId !== 'string') return send(res, 400, { error: 'Choose the Pro Interactive product and one of your websites.' });
      const order = await createOrder(user, websiteId);
      return order ? send(res, 201, { order }) : send(res, 409, { error: 'Pro Interactive checkout is not available for this website.' });
    }

    if (path === '/api/payments/orders/claim' && method === 'POST') {
      const orderId = url.searchParams.get('orderId');
      if (!orderId) return send(res, 400, { error: 'orderId is required.' });
      const order = await submitPaymentClaim(orderId, user.id);
      if (!order) return send(res, 404, { error: 'Order not found.' });
      return send(res, 200, { order });
    }

    if (path === '/api/payments/orders/status' && method === 'GET') {
      const orderId = url.searchParams.get('orderId');
      if (!orderId) return send(res, 400, { error: 'orderId is required.' });
      const order = await getOwnedOrder(orderId, user.id);
      return order ? send(res, 200, { order }) : send(res, 404, { error: 'Order not found.' });
    }

    if (path === '/api/payments/product-access' && method === 'GET') {
      const websiteId = url.searchParams.get('websiteId');
      const productId = url.searchParams.get('productId');
      if (!websiteId || !productId) return send(res, 400, { error: 'websiteId and productId are required.' });
      return send(res, 200, { access: productId === 'pro-interactive' && await getWebsiteAccess(websiteId, user.id) });
    }

    if (path === '/api/payments/admin/process' && method === 'POST') {
      if (!await isAdmin(user)) return send(res, 403, { error: 'Admin access required.' });
      return send(res, 200, await processGmailPayments());
    }

    if (path === '/api/payments/admin/orders' && method === 'GET') {
      if (!await isAdmin(user)) return send(res, 403, { error: 'Admin access required.' });
      return send(res, 200, await listAdminOrders(url.searchParams.get('status')));
    }

    if (path === '/api/payments/admin/approve' && method === 'POST') {
      if (!await isAdmin(user)) return send(res, 403, { error: 'Admin access required.' });
      const orderId = url.searchParams.get('orderId');
      if (!orderId) return send(res, 400, { error: 'orderId is required.' });
      const { reason } = await body(req);
      if (typeof reason !== 'string' || reason.trim().length < 5 || reason.trim().length > 500) return send(res, 400, { error: 'Enter a review reason between 5 and 500 characters.' });
      const order = await approveManualOrder(orderId, user.id, reason.trim());
      return order ? send(res, 200, { order }) : send(res, 404, { error: 'Manual-review order not found.' });
    }

    return send(res, 404, { error: 'Payment route not found.' });
  } catch (error) {
    console.error('[Payment API error]', error.message);
    const configError = /not configured|not available|Choose a Pro Interactive|already enabled/i.test(error.message || '');
    return send(res, configError ? 503 : 500, { error: configError ? error.message : 'Payment service is temporarily unavailable. Please try again.' });
  }
}

export function createPaymentFunction(route) {
  return (req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    req.url = `${route}${requestUrl.search}`;
    return handlePaymentRequest(req, res);
  };
}
