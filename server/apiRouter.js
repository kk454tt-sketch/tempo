import { adminAuth, adminDb, FieldValue } from './firebaseAdmin.js';
import { handlePaymentRequest } from './paymentRoutes.js';
import crypto from 'node:crypto';

// Helper to read JSON request body
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

// Helper to send JSON response
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

/**
 * Server-side Firebase ID token verification using Firebase Admin SDK.
 * Auto-provisions or updates the user profile document in Firestore `users/{uid}`.
 */
export async function authenticateUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    const email = (decodedToken.email || `${firebaseUid}@tempo.user`).toLowerCase().trim();
    const name = decodedToken.name || decodedToken.email?.split('@')[0] || 'Creator';
    const avatar = decodedToken.picture || '';

    // Check or provision user profile in Firestore
    const userDocRef = adminDb.collection('users').doc(firebaseUid);
    const userSnap = await userDocRef.get();

    const now = new Date().toISOString();
    if (!userSnap.exists) {
      const newUser = {
        id: firebaseUid,
        email,
        name,
        fullName: name,
        avatarUrl: avatar,
        bio: '',
        profileData: {},
        createdAt: now,
        updatedAt: now,
      };
      await userDocRef.set(newUser, { merge: true });
      return {
        id: firebaseUid,
        email,
        name,
        avatarUrl: avatar,
        createdAt: now,
      };
    } else {
      const existingData = userSnap.data() || {};
      const needsUpdate =
        (email && existingData.email !== email) ||
        (avatar && !existingData.avatarUrl && avatar);

      if (needsUpdate) {
        await userDocRef.update({
          ...(email ? { email } : {}),
          ...(avatar && !existingData.avatarUrl ? { avatarUrl: avatar } : {}),
          updatedAt: now,
        });
      }

      return {
        id: firebaseUid,
        email: existingData.email || email,
        name: existingData.name || existingData.fullName || name,
        avatarUrl: existingData.avatarUrl || avatar || '',
        createdAt: existingData.createdAt || now,
      };
    }
  } catch (verifyErr) {
    console.warn('[Auth] Firebase ID token verification error:', verifyErr.message);
    return null;
  }
}

// Helper to format website row safely for API consumers
function formatWebsiteDoc(docId, data, isOwner = true) {
  if (!data) return null;
  const formatted = {
    id: data.id || docId,
    templateId: data.templateId || 'royal-luxury-envelope',
    eventType: data.eventType || 'Celebration',
    title: data.title || 'Untitled Event',
    slug: (data.slug || '').toLowerCase().trim(),
    status: data.status || 'draft',
    eventData: typeof data.eventData === 'string' ? JSON.parse(data.eventData || '{}') : (data.eventData || {}),
    isLifetime: Boolean(data.isLifetime),
    proInteractiveEnabled: Boolean(data.proInteractiveEnabled),
    metrics: {
      viewsCount: Number(data.viewsCount || 0),
      rsvpsCount: Number(data.rsvpsCount || 0),
      dietaryCount: 0,
      isGuestListClosed: false,
    },
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    expiresAt: data.expiresAt || null,
  };

  // Only include owner userId for authorized owner requests; omit for public visitors
  if (isOwner) {
    formatted.userId = data.userId;
  }
  return formatted;
}

export async function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  // Delegate payment & cron endpoints
  if (pathname.startsWith('/api/payments/') || pathname === '/api/cron/payments') {
    return handlePaymentRequest(req, res);
  }

  try {
    /* ========================================================
       1. AUTHENTICATION & USER SESSIONS
       ======================================================== */
    if (pathname === '/api/auth/me' && method === 'GET') {
      const authenticatedUser = await authenticateUser(req);
      if (!authenticatedUser) {
        return sendJson(res, 401, { error: 'Unauthorized: Valid Firebase token required' });
      }
      return sendJson(res, 200, { user: authenticatedUser });
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      return sendJson(res, 200, { success: true });
    }

    /* ========================================================
       2. USER PROFILE (PHASE 2 - FIRESTORE `users/{uid}`)
       ======================================================== */
    if (pathname === '/api/profiles/me' && method === 'GET') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const userDocRef = adminDb.collection('users').doc(user.id);
      const docSnap = await userDocRef.get();
      const now = new Date().toISOString();

      if (!docSnap.exists) {
        const initialProfile = {
          id: user.id,
          email: user.email,
          name: user.name,
          fullName: user.name,
          avatarUrl: user.avatarUrl || '',
          bio: '',
          profileData: {},
          createdAt: now,
          updatedAt: now,
        };
        await userDocRef.set(initialProfile);
        return sendJson(res, 200, {
          profile: {
            id: `prof_${user.id}`,
            userId: user.id,
            fullName: user.name,
            avatarUrl: user.avatarUrl || '',
            bio: '',
            profileData: {},
            createdAt: now,
            updatedAt: now,
          },
        });
      }

      const data = docSnap.data() || {};
      return sendJson(res, 200, {
        profile: {
          id: `prof_${user.id}`,
          userId: user.id,
          fullName: data.fullName || data.name || user.name,
          avatarUrl: data.avatarUrl || user.avatarUrl || '',
          bio: data.bio || '',
          profileData: typeof data.profileData === 'object' ? data.profileData : {},
          createdAt: data.createdAt || now,
          updatedAt: data.updatedAt || now,
        },
      });
    }

    if (pathname === '/api/profiles/me' && method === 'PUT') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const updates = await parseBody(req);
      const now = new Date().toISOString();
      const userDocRef = adminDb.collection('users').doc(user.id);
      const docSnap = await userDocRef.get();
      const existing = docSnap.exists ? docSnap.data() || {} : {};

      const newFullName = updates.fullName || updates.name || existing.fullName || existing.name || user.name;
      const newAvatar = updates.avatarUrl !== undefined ? updates.avatarUrl : (existing.avatarUrl || '');
      const newBio = updates.bio !== undefined ? updates.bio : (existing.bio || '');
      const newProfileData = updates.profileData !== undefined ? updates.profileData : (existing.profileData || {});

      const updatedPayload = {
        name: newFullName,
        fullName: newFullName,
        avatarUrl: newAvatar,
        bio: newBio,
        profileData: newProfileData,
        updatedAt: now,
      };

      await userDocRef.set(updatedPayload, { merge: true });

      return sendJson(res, 200, {
        profile: {
          id: `prof_${user.id}`,
          userId: user.id,
          fullName: newFullName,
          avatarUrl: newAvatar,
          bio: newBio,
          profileData: newProfileData,
          createdAt: existing.createdAt || now,
          updatedAt: now,
        },
      });
    }

    /* ========================================================
       3. SITE OWNERSHIP & CRUD (PHASE 3 - FIRESTORE `websites`)
       ======================================================== */
    // GET /api/websites: returns only websites owned by authenticated user
    if (pathname === '/api/websites' && method === 'GET') {
      const user = await authenticateUser(req);
      if (!user) {
        return sendJson(res, 401, { error: 'Authentication required to view your websites' });
      }

      const snapshot = await adminDb
        .collection('websites')
        .where('userId', '==', user.id)
        .get();

      const websites = [];
      snapshot.forEach((doc) => {
        websites.push(formatWebsiteDoc(doc.id, doc.data(), true));
      });

      // Sort descending by updatedAt
      websites.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      return sendJson(res, 200, { websites });
    }

    // GET /api/websites/by-slug/:slug: Public site for visitors
    if (pathname.startsWith('/api/websites/by-slug/') && method === 'GET') {
      const slug = decodeURIComponent(pathname.replace('/api/websites/by-slug/', '')).toLowerCase().trim();
      
      const querySnap = await adminDb
        .collection('websites')
        .where('slug', '==', slug)
        .get();

      let targetDoc = null;
      let targetData = null;

      querySnap.forEach((doc) => {
        const data = doc.data();
        if (!targetDoc || data.status === 'published') {
          targetDoc = doc;
          targetData = data;
        }
      });

      if (!targetDoc) {
        return sendJson(res, 404, { error: 'Website not found or not published' });
      }

      // Increment view count atomically in Firestore
      try {
        await targetDoc.ref.update({
          viewsCount: FieldValue.increment(1),
        });
      } catch (_) {}

      // Public visitors MUST NOT see private owner user ID
      return sendJson(res, 200, { website: formatWebsiteDoc(targetDoc.id, targetData, false) });
    }

    // GET /api/websites/:id: Owner only for private/draft, public only if published
    if (pathname.startsWith('/api/websites/') && method === 'GET' && !pathname.includes('/by-slug/')) {
      const id = pathname.replace('/api/websites/', '');
      const docRef = adminDb.collection('websites').doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return sendJson(res, 404, { error: 'Website not found' });
      }

      const data = docSnap.data();
      if (data.status !== 'published') {
        const user = await authenticateUser(req);
        if (!user || user.id !== data.userId) {
          return sendJson(res, 403, { error: 'Access denied: You do not have permission to view this private site.' });
        }
        return sendJson(res, 200, { website: formatWebsiteDoc(docSnap.id, data, true) });
      }

      return sendJson(res, 200, { website: formatWebsiteDoc(docSnap.id, data, false) });
    }

    // POST /api/websites: Create website with server-enforced authenticated ownership
    if (pathname === '/api/websites' && method === 'POST') {
      const user = await authenticateUser(req);
      if (!user) {
        return sendJson(res, 401, { error: 'Authentication required to create a website' });
      }

      const payload = await parseBody(req);
      const cleanSlug = (payload.slug || `event-${Date.now()}`).toLowerCase().trim();
      const now = new Date().toISOString();

      // Check if site with this slug already exists for this user
      const existingSlugQuery = await adminDb
        .collection('websites')
        .where('slug', '==', cleanSlug)
        .get();

      if (!existingSlugQuery.empty) {
        const existingDoc = existingSlugQuery.docs[0];
        const existingData = existingDoc.data();

        // If owned by same user, update it
        if (existingData.userId === user.id) {
          const updatePayload = {
            title: payload.title || existingData.title || 'My Event Website',
            templateId: payload.templateId || existingData.templateId || 'royal-luxury-envelope',
            eventType: payload.eventType || existingData.eventType || 'Celebration',
            status: payload.status || existingData.status || 'published',
            eventData: payload.eventData || existingData.eventData || {},
            isLifetime: Boolean(payload.isLifetime),
            updatedAt: now,
          };
          await existingDoc.ref.update(updatePayload);
          const updatedSnap = await existingDoc.ref.get();
          return sendJson(res, 200, { website: formatWebsiteDoc(existingDoc.id, updatedSnap.data(), true) });
        }
      }

      const siteId = `site_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const newWebsiteData = {
        id: siteId,
        userId: user.id,
        templateId: payload.templateId || 'royal-luxury-envelope',
        eventType: payload.eventType || 'Celebration',
        title: payload.title || 'My Event Website',
        slug: cleanSlug,
        status: payload.status || 'published',
        eventData: payload.eventData || {},
        isLifetime: Boolean(payload.isLifetime),
        proInteractiveEnabled: false,
        viewsCount: 0,
        rsvpsCount: 0,
        createdAt: now,
        updatedAt: now,
        expiresAt: payload.expiresAt || null,
      };

      await adminDb.collection('websites').doc(siteId).set(newWebsiteData);
      return sendJson(res, 201, { website: formatWebsiteDoc(siteId, newWebsiteData, true) });
    }

    // PUT /api/websites/:id: Update website with strict ownership verification
    if (pathname.startsWith('/api/websites/') && method === 'PUT') {
      const user = await authenticateUser(req);
      if (!user) {
        return sendJson(res, 401, { error: 'Authentication required' });
      }

      const id = pathname.replace('/api/websites/', '');
      const docRef = adminDb.collection('websites').doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return sendJson(res, 404, { error: 'Website not found' });
      }

      const existing = docSnap.data();
      if (existing.userId !== user.id) {
        return sendJson(res, 403, { error: 'Access denied: You do not own this website.' });
      }

      const updates = await parseBody(req);
      const now = new Date().toISOString();

      let eventDataObj = existing.eventData || {};
      if (updates.eventData) {
        eventDataObj = { ...eventDataObj, ...updates.eventData };
      }

      const updatePayload = {
        title: updates.title !== undefined ? updates.title : existing.title,
        status: updates.status !== undefined ? updates.status : existing.status,
        eventType: updates.eventType !== undefined ? updates.eventType : existing.eventType,
        slug: updates.slug ? updates.slug.toLowerCase().trim() : existing.slug,
        eventData: eventDataObj,
        updatedAt: now,
      };

      await docRef.update(updatePayload);
      const updatedSnap = await docRef.get();
      return sendJson(res, 200, { website: formatWebsiteDoc(id, updatedSnap.data(), true) });
    }

    // DELETE /api/websites/:id: Delete website with strict ownership verification
    if (pathname.startsWith('/api/websites/') && method === 'DELETE') {
      const user = await authenticateUser(req);
      if (!user) {
        return sendJson(res, 401, { error: 'Authentication required' });
      }

      const id = pathname.replace('/api/websites/', '');
      const docRef = adminDb.collection('websites').doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return sendJson(res, 404, { error: 'Website not found' });
      }

      const existing = docSnap.data();
      if (existing.userId !== user.id) {
        return sendJson(res, 403, { error: 'Access denied: You do not own this website.' });
      }

      await docRef.delete();
      return sendJson(res, 200, { success: true });
    }

    /* ========================================================
       4. SAVED DRAFTS SYSTEM (PHASE 3 - FIRESTORE `drafts`)
       ======================================================== */
    // GET /api/drafts: Fetch drafts owned by authenticated user
    if (pathname === '/api/drafts' && method === 'GET') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const snap = await adminDb
        .collection('drafts')
        .where('userId', '==', user.id)
        .get();

      const drafts = [];
      snap.forEach((doc) => {
        const d = doc.data();
        drafts.push({
          id: d.id || doc.id,
          siteId: d.siteId || null,
          userId: d.userId,
          templateId: d.templateId,
          title: d.title,
          slug: d.slug,
          eventType: d.eventType,
          eventData: typeof d.eventData === 'string' ? JSON.parse(d.eventData || '{}') : (d.eventData || {}),
          status: d.status || 'draft',
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        });
      });

      drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return sendJson(res, 200, { drafts });
    }

    // POST /api/drafts: Save draft with authenticated user ownership
    if (pathname === '/api/drafts' && method === 'POST') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const payload = await parseBody(req);
      const now = new Date().toISOString();
      const draftId = payload.id || `draft_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const docRef = adminDb.collection('drafts').doc(draftId);

      const existingSnap = await docRef.get();
      if (existingSnap.exists) {
        const existingData = existingSnap.data();
        if (existingData.userId !== user.id) {
          return sendJson(res, 403, { error: 'Access denied: You do not own this draft.' });
        }

        const updatePayload = {
          title: payload.title || existingData.title,
          templateId: payload.templateId || existingData.templateId,
          slug: payload.slug || existingData.slug,
          eventType: payload.eventType || existingData.eventType,
          eventData: payload.eventData || existingData.eventData || {},
          siteId: payload.siteId || existingData.siteId || null,
          updatedAt: now,
        };
        await docRef.update(updatePayload);
      } else {
        const newDraft = {
          id: draftId,
          siteId: payload.siteId || null,
          userId: user.id,
          templateId: payload.templateId || 'keepsake-birthday-scrapbook',
          title: payload.title || 'Untitled Event Draft',
          slug: payload.slug || null,
          eventType: payload.eventType || 'Celebration',
          eventData: payload.eventData || {},
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        };
        await docRef.set(newDraft);
      }

      const savedSnap = await docRef.get();
      const saved = savedSnap.data();
      return sendJson(res, 200, {
        draft: {
          id: saved.id || docRef.id,
          siteId: saved.siteId,
          userId: saved.userId,
          templateId: saved.templateId,
          title: saved.title,
          slug: saved.slug,
          eventType: saved.eventType,
          eventData: saved.eventData,
          status: saved.status,
          createdAt: saved.createdAt,
          updatedAt: saved.updatedAt,
        },
      });
    }

    // GET /api/drafts/:id
    if (pathname.startsWith('/api/drafts/') && method === 'GET') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const id = pathname.replace('/api/drafts/', '');
      const docSnap = await adminDb.collection('drafts').doc(id).get();
      if (!docSnap.exists) return sendJson(res, 404, { error: 'Draft not found' });

      const draft = docSnap.data();
      if (draft.userId !== user.id) return sendJson(res, 403, { error: 'Access denied: You do not own this draft' });

      return sendJson(res, 200, {
        draft: {
          id: draft.id || docSnap.id,
          siteId: draft.siteId,
          userId: draft.userId,
          templateId: draft.templateId,
          title: draft.title,
          slug: draft.slug,
          eventType: draft.eventType,
          eventData: draft.eventData,
          status: draft.status,
          createdAt: draft.createdAt,
          updatedAt: draft.updatedAt,
        },
      });
    }

    // DELETE /api/drafts/:id
    if (pathname.startsWith('/api/drafts/') && method === 'DELETE') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const id = pathname.replace('/api/drafts/', '');
      const docRef = adminDb.collection('drafts').doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) return sendJson(res, 404, { error: 'Draft not found' });

      const draft = docSnap.data();
      if (draft.userId !== user.id) return sendJson(res, 403, { error: 'Access denied: You do not own this draft' });

      await docRef.delete();
      return sendJson(res, 200, { success: true });
    }

    /* ========================================================
       5. 1-MONTH PREMIUM SUBSCRIPTIONS (PHASE 5 - FIRESTORE `subscriptions`)
       ======================================================== */
    // GET /api/subscriptions/me: Check user's subscription entitlement
    if (pathname === '/api/subscriptions/me' && method === 'GET') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const subSnap = await adminDb
        .collection('subscriptions')
        .where('userId', '==', user.id)
        .get();

      if (subSnap.empty) {
        return sendJson(res, 200, {
          hasSubscription: false,
          isPremiumActive: false,
          plan: 'free',
          message: 'No active subscription found',
        });
      }

      const subs = [];
      subSnap.forEach((doc) => subs.push({ id: doc.id, ...doc.data() }));
      subs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const sub = subs[0];

      const now = new Date();
      const expiresAt = new Date(sub.expiresAt || sub.expires_at);
      const isStillValid = (sub.paymentStatus === 'active' || sub.paymentStatus === 'completed' || sub.payment_status === 'active') && now < expiresAt;

      // Automatically mark expired if elapsed
      if (!isStillValid && (sub.paymentStatus === 'active' || sub.payment_status === 'active')) {
        await adminDb.collection('subscriptions').doc(sub.id).update({
          paymentStatus: 'expired',
          payment_status: 'expired',
          updatedAt: now.toISOString(),
        });
        sub.paymentStatus = 'expired';
      }

      return sendJson(res, 200, {
        hasSubscription: true,
        isPremiumActive: isStillValid,
        plan: sub.plan || 'premium-pro',
        startedAt: sub.startedAt || sub.started_at,
        expiresAt: (sub.expiresAt || sub.expires_at),
        paymentStatus: sub.paymentStatus || sub.payment_status,
        daysRemaining: isStillValid ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
      });
    }

    // POST /api/subscriptions/verify-payment: Server-side payment verification & 1-month grant
    if (pathname === '/api/subscriptions/verify-payment' && method === 'POST') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const { transactionReference, plan = 'premium-pro', amount = 499 } = await parseBody(req);
      if (!transactionReference || typeof transactionReference !== 'string' || transactionReference.trim().length < 4) {
        return sendJson(res, 400, { error: 'Valid transaction reference (UTR or UPI reference) is required.' });
      }

      const cleanRef = transactionReference.trim().toUpperCase();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const txnId = `txn_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const subId = `sub_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

      // Firestore transaction to atomically prevent duplicate transaction references
      let txnResult;
      try {
        txnResult = await adminDb.runTransaction(async (t) => {
          const dupQuery = await adminDb
            .collection('paymentTransactions')
            .where('transactionReference', '==', cleanRef)
            .get();

          if (!dupQuery.empty) {
            throw new Error('DUPLICATE_TXN');
          }

          const txnDocRef = adminDb.collection('paymentTransactions').doc(txnId);
          const subDocRef = adminDb.collection('subscriptions').doc(subId);

          t.set(txnDocRef, {
            id: txnId,
            userId: user.id,
            subscriptionId: subId,
            transactionReference: cleanRef,
            amount: Number(amount) || 499,
            currency: 'INR',
            status: 'verified',
            verifiedAt: now.toISOString(),
            createdAt: now.toISOString(),
          });

          t.set(subDocRef, {
            id: subId,
            userId: user.id,
            plan,
            paymentStatus: 'active',
            startedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            providerPaymentId: cleanRef,
            amount: Number(amount) || 499,
            currency: 'INR',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          });

          return { success: true };
        });
      } catch (err) {
        if (err.message === 'DUPLICATE_TXN') {
          return sendJson(res, 400, { error: 'This transaction reference has already been claimed or verified.' });
        }
        throw err;
      }

      return sendJson(res, 200, {
        success: true,
        isPremiumActive: true,
        subscriptionId: subId,
        plan,
        startedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        message: 'Payment verified successfully! 1-Month Premium Access is now active.',
      });
    }

    /* ========================================================
       6. RSVPS STORAGE (PHASE 4 - FIRESTORE `rsvps`)
       ======================================================== */
    if (pathname === '/api/rsvps' && method === 'POST') {
      const payload = await parseBody(req);
      const id = `rsvp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const now = new Date().toISOString();
      const slug = (payload.slug || '').toLowerCase().trim();

      const rsvpData = {
        id,
        websiteId: payload.websiteId || null,
        slug,
        guestName: payload.guestName || 'Guest',
        guestEmail: payload.guestEmail || '',
        attendance: payload.attendance || 'accept',
        mealPreference: payload.mealPreference || null,
        dietaryNotes: payload.dietaryNotes || null,
        songRequest: payload.songRequest || null,
        plusOnes: Number(payload.plusOnes) || 0,
        customFields: payload.customFields || {},
        createdAt: now,
      };

      await adminDb.collection('rsvps').doc(id).set(rsvpData);

      // Increment RSVP count on matching website
      if (slug) {
        const sitesSnap = await adminDb
          .collection('websites')
          .where('slug', '==', slug)
          .get();
        if (!sitesSnap.empty) {
          await sitesSnap.docs[0].ref.update({
            rsvpsCount: FieldValue.increment(1),
          });
        }
      }

      return sendJson(res, 201, { success: true, id, message: 'RSVP recorded in database' });
    }

    if (pathname.startsWith('/api/rsvps/') && method === 'GET') {
      const slug = decodeURIComponent(pathname.replace('/api/rsvps/', '')).toLowerCase().trim();
      const snapshot = await adminDb
        .collection('rsvps')
        .where('slug', '==', slug)
        .get();

      const rsvps = [];
      snapshot.forEach((doc) => {
        const r = doc.data();
        rsvps.push({
          id: r.id || doc.id,
          websiteId: r.websiteId,
          slug: r.slug,
          guestName: r.guestName,
          guestEmail: r.guestEmail,
          attendance: r.attendance,
          mealPreference: r.mealPreference,
          dietaryNotes: r.dietaryNotes,
          songRequest: r.songRequest,
          plusOnes: r.plusOnes,
          submittedAt: r.createdAt,
        });
      });

      rsvps.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      return sendJson(res, 200, { rsvps });
    }

    /* ========================================================
       7. GUESTBOOK MESSAGES (PHASE 4 - FIRESTORE `guestbookEntries`)
       ======================================================== */
    if (pathname.startsWith('/api/guestbook/') && method === 'GET') {
      const slug = decodeURIComponent(pathname.replace('/api/guestbook/', '')).toLowerCase().trim();

      // Look up website by slug
      const sitesSnap = await adminDb
        .collection('websites')
        .where('slug', '==', slug)
        .get();

      if (sitesSnap.empty) {
        return sendJson(res, 404, { error: 'Website not found' });
      }

      const websiteDoc = sitesSnap.docs[0];
      const websiteId = websiteDoc.id;

      const entriesSnap = await adminDb
        .collection('guestbookEntries')
        .where('websiteId', '==', websiteId)
        .get();

      const entries = [];
      entriesSnap.forEach((doc) => {
        const e = doc.data();
        entries.push({
          id: e.id || doc.id,
          name: e.guestName || e.name || 'Guest',
          message: e.message || '',
          timestamp: e.createdAt ? new Date(e.createdAt).toLocaleString() : new Date().toLocaleString(),
          createdAt: e.createdAt || new Date().toISOString(),
        });
      });

      entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return sendJson(res, 200, { entries });
    }

    if (pathname === '/api/guestbook' && method === 'POST') {
      const { slug, name, message } = await parseBody(req);
      if (!slug || !name || !message) {
        return sendJson(res, 400, { error: 'slug, name, and message are required' });
      }

      const cleanSlug = slug.toLowerCase().trim();
      const sitesSnap = await adminDb
        .collection('websites')
        .where('slug', '==', cleanSlug)
        .get();

      if (sitesSnap.empty) {
        return sendJson(res, 404, { error: 'Website not found' });
      }

      const websiteDoc = sitesSnap.docs[0];
      const websiteId = websiteDoc.id;
      const entryId = `gb_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const now = new Date().toISOString();

      const newEntry = {
        id: entryId,
        websiteId,
        slug: cleanSlug,
        guestName: String(name).trim(),
        message: String(message).trim(),
        createdAt: now,
      };

      await adminDb.collection('guestbookEntries').doc(entryId).set(newEntry);

      return sendJson(res, 201, {
        entry: {
          id: entryId,
          name: newEntry.guestName,
          message: newEntry.message,
          timestamp: new Date(now).toLocaleString(),
        },
      });
    }

    /* ========================================================
       8. STUDENT PORTAL / HUB DATA (PHASE 4 - FIRESTORE `portalHubs`)
       ======================================================== */
    if (pathname.startsWith('/api/hubs/') && method === 'GET') {
      const slug = decodeURIComponent(pathname.replace('/api/hubs/', '')).toLowerCase().trim();
      const docSnap = await adminDb.collection('portalHubs').doc(slug).get();

      if (!docSnap.exists) {
        return sendJson(res, 200, {
          slug,
          hubData: null,
          superlativeVotes: {},
          studyGroups: [],
        });
      }

      const row = docSnap.data();
      return sendJson(res, 200, {
        slug: row.slug || slug,
        hubData: row.hubData || null,
        superlativeVotes: row.superlativeVotes || {},
        studyGroups: row.studyGroups || [],
      });
    }

    if (pathname.startsWith('/api/hubs/') && method === 'PUT') {
      const slug = decodeURIComponent(pathname.replace('/api/hubs/', '')).toLowerCase().trim();
      const { hubData, websiteId } = await parseBody(req);
      const now = new Date().toISOString();

      await adminDb.collection('portalHubs').doc(slug).set(
        {
          slug,
          websiteId: websiteId || null,
          hubData: hubData || {},
          updatedAt: now,
        },
        { merge: true }
      );

      return sendJson(res, 200, { success: true, message: 'Portal hub saved to database' });
    }

    if (pathname.startsWith('/api/hubs/') && pathname.endsWith('/vote') && method === 'POST') {
      const slug = decodeURIComponent(pathname.replace('/api/hubs/', '').replace('/vote', '')).toLowerCase().trim();
      const { superlativeKey } = await parseBody(req);
      const now = new Date().toISOString();

      const docRef = adminDb.collection('portalHubs').doc(slug);
      let updatedVotes = {};

      await adminDb.runTransaction(async (t) => {
        const snap = await t.get(docRef);
        let votes = {};
        if (snap.exists) {
          votes = snap.data().superlativeVotes || {};
        }

        if (superlativeKey) {
          votes[superlativeKey] = (votes[superlativeKey] || 0) + 1;
        }
        updatedVotes = votes;

        t.set(
          docRef,
          {
            slug,
            superlativeVotes: votes,
            updatedAt: now,
          },
          { merge: true }
        );
      });

      return sendJson(res, 200, { success: true, votes: updatedVotes });
    }

    return sendJson(res, 404, { error: 'API route not found' });
  } catch (error) {
    console.error('[API Router Error]', error);
    return sendJson(res, 500, { error: error.message || 'Internal server error' });
  }
}
