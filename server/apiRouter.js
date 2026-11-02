import { db } from './db.js';
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

// Helper to extract authenticated user from Authorization header
export async function authenticateUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();

  // 1. Check local user_sessions table
  const sessionRow = db.prepare('SELECT * FROM user_sessions WHERE token = ?').get(token);
  if (sessionRow) {
    if (new Date(sessionRow.expires_at) > new Date()) {
      const userRow = db.prepare('SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?').get(sessionRow.user_id);
      if (userRow) {
        return {
          id: userRow.id,
          email: userRow.email,
          name: userRow.name,
          avatarUrl: userRow.avatar_url || '',
          createdAt: userRow.created_at,
        };
      }
    } else {
      // Clean up expired session
      try {
        db.prepare('DELETE FROM user_sessions WHERE token = ?').run(token);
      } catch (_) {}
    }
  }

  // 2. Fallback check for session token mapped directly to user ID (e.g. for testing / direct ID token)
  const directUser = db.prepare('SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?').get(token);
  if (directUser) {
    return {
      id: directUser.id,
      email: directUser.email,
      name: directUser.name,
      avatarUrl: directUser.avatar_url || '',
      createdAt: directUser.created_at,
    };
  }

  // 3. Supabase JWT Token support (JWT tokens with 3 parts)
  if (token.includes('.')) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jwtPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
        if (jwtPayload && jwtPayload.sub) {
          // Check or auto-provision user in SQLite
          let userRow = db.prepare('SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?').get(jwtPayload.sub);
          if (!userRow) {
            const now = new Date().toISOString();
            const email = jwtPayload.email || `${jwtPayload.sub}@supabase.user`;
            const name = jwtPayload.user_metadata?.full_name || email.split('@')[0] || 'Creator';
            const avatar = jwtPayload.user_metadata?.avatar_url || '';
            try {
              db.prepare(`
                INSERT INTO users (id, email, password_hash, name, avatar_url, created_at, updated_at)
                VALUES (?, ?, '', ?, ?, ?, ?)
              `).run(jwtPayload.sub, email, name, avatar, now, now);
            } catch (_) {}
            userRow = db.prepare('SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?').get(jwtPayload.sub);
          }
          if (userRow) {
            return {
              id: userRow.id,
              email: userRow.email,
              name: userRow.name,
              avatarUrl: userRow.avatar_url || '',
              createdAt: userRow.created_at,
            };
          }
        }
      }
    } catch (_) {}
  }

  return null;
}

// Generate secure session token
function createSessionToken(userId) {
  const token = `tok_${crypto.randomBytes(24).toString('hex')}_${Date.now().toString(36)}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO user_sessions (token, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(token, userId, expiresAt, now);
  return token;
}

// Helper to format website row safely
function formatWebsiteRow(row, isOwner = true) {
  if (!row) return null;
  const data = {
    id: row.id,
    templateId: row.template_id,
    eventType: row.event_type,
    title: row.title,
    slug: row.slug,
    status: row.status,
    eventData: JSON.parse(row.event_data || '{}'),
    isLifetime: Boolean(row.is_lifetime),
    metrics: {
      viewsCount: row.views_count || 0,
      rsvpsCount: row.rsvps_count || 0,
      dietaryCount: 0,
      isGuestListClosed: false,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at || null,
  };

  // Only include owner user ID for owner requests; omit for public visitors
  if (isOwner) {
    data.userId = row.user_id;
  }
  return data;
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

  if (pathname.startsWith('/api/payments/') || pathname === '/api/cron/payments') {
    return handlePaymentRequest(req, res);
  }

  try {
    /* ========================================================
       1. AUTHENTICATION & USER SESSIONS
       ======================================================== */
    if (pathname === '/api/auth/register' && method === 'POST') {
      const { name, email, password } = await parseBody(req);
      if (!email || typeof email !== 'string') {
        return sendJson(res, 400, { error: 'Valid email is required' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
      if (existing) {
        return sendJson(res, 400, { error: 'An account with this email already exists' });
      }

      const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const now = new Date().toISOString();
      const userName = (name && String(name).trim()) || cleanEmail.split('@')[0];

      db.prepare(`
        INSERT INTO users (id, email, password, name, avatar_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, cleanEmail, password || '', userName, '', now, now);

      db.prepare(`
        INSERT INTO profiles (id, user_id, full_name, avatar_url, bio, profile_data, created_at, updated_at)
        VALUES (?, ?, ?, '', '', '{}', ?, ?)
      `).run(`prof_${userId}`, userId, userName, now, now);

      const token = createSessionToken(userId);
      const user = {
        id: userId,
        email: cleanEmail,
        name: userName,
        avatarUrl: '',
        createdAt: now,
      };
      return sendJson(res, 201, { user, token });
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const { email, password } = await parseBody(req);
      if (!email || typeof email !== 'string') {
        return sendJson(res, 400, { error: 'Valid email is required' });
      }

      const cleanEmail = email.toLowerCase().trim();
      let userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

      if (!userRow) {
        // If account does not exist and password was provided, register automatically
        const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const now = new Date().toISOString();
        const userName = cleanEmail.split('@')[0];

        db.prepare(`
          INSERT INTO users (id, email, password, name, avatar_url, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, cleanEmail, password || '', userName, '', now, now);

        db.prepare(`
          INSERT INTO profiles (id, user_id, full_name, avatar_url, bio, profile_data, created_at, updated_at)
          VALUES (?, ?, ?, '', '', '{}', ?, ?)
        `).run(`prof_${userId}`, userId, userName, now, now);

        userRow = {
          id: userId,
          email: cleanEmail,
          name: userName,
          avatar_url: '',
          created_at: now,
        };
      } else if (userRow.password && password && userRow.password !== password) {
        // Simple password check if password was set
        return sendJson(res, 401, { error: 'Invalid password. Please check your credentials.' });
      }

      const token = createSessionToken(userRow.id);
      return sendJson(res, 200, {
        user: {
          id: userRow.id,
          email: userRow.email,
          name: userRow.name,
          avatarUrl: userRow.avatar_url || '',
          createdAt: userRow.created_at,
        },
        token,
      });
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        try {
          db.prepare('DELETE FROM user_sessions WHERE token = ?').run(token);
        } catch (_) {}
      }
      return sendJson(res, 200, { success: true });
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      const authenticatedUser = await authenticateUser(req);
      if (!authenticatedUser) {
        return sendJson(res, 401, { error: 'Unauthorized: Valid session token required' });
      }

      return sendJson(res, 200, { user: authenticatedUser });
    }

    /* ========================================================
       2. USER PROFILE (PHASE 3)
       ======================================================== */
    if (pathname === '/api/profiles/me' && method === 'GET') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      let profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
      if (!profile) {
        const now = new Date().toISOString();
        db.prepare(`
          INSERT INTO profiles (id, user_id, full_name, avatar_url, bio, profile_data, created_at, updated_at)
          VALUES (?, ?, ?, ?, '', '{}', ?, ?)
        `).run(`prof_${user.id}`, user.id, user.name, user.avatarUrl, now, now);
        profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
      }

      return sendJson(res, 200, {
        profile: {
          id: profile.id,
          userId: profile.user_id,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url || '',
          bio: profile.bio || '',
          profileData: JSON.parse(profile.profile_data || '{}'),
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        },
      });
    }

    if (pathname === '/api/profiles/me' && method === 'PUT') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const updates = await parseBody(req);
      const now = new Date().toISOString();

      let profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
      if (!profile) {
        db.prepare(`
          INSERT INTO profiles (id, user_id, full_name, avatar_url, bio, profile_data, created_at, updated_at)
          VALUES (?, ?, ?, ?, '', '{}', ?, ?)
        `).run(`prof_${user.id}`, user.id, user.name, user.avatarUrl, now, now);
        profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
      }

      const newName = updates.fullName || updates.name || profile.full_name;
      const newAvatar = updates.avatarUrl !== undefined ? updates.avatarUrl : profile.avatar_url;
      const newBio = updates.bio !== undefined ? updates.bio : profile.bio;
      const newProfileData = updates.profileData ? JSON.stringify(updates.profileData) : profile.profile_data;

      db.prepare(`
        UPDATE profiles SET
          full_name = ?,
          avatar_url = ?,
          bio = ?,
          profile_data = ?,
          updated_at = ?
        WHERE user_id = ?
      `).run(newName, newAvatar, newBio, newProfileData, now, user.id);

      // Also update name on user record if changed
      if (newName !== profile.full_name) {
        db.prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?').run(newName, now, user.id);
      }

      const updated = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
      return sendJson(res, 200, {
        profile: {
          id: updated.id,
          userId: updated.user_id,
          fullName: updated.full_name,
          avatarUrl: updated.avatar_url || '',
          bio: updated.bio || '',
          profileData: JSON.parse(updated.profile_data || '{}'),
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
        },
      });
    }

    /* ========================================================
       3. SITE OWNERSHIP & CRUD (PHASE 4 & PHASE 12)
       ======================================================== */
    // GET /api/websites: returns only websites owned by authenticated user
    if (pathname === '/api/websites' && method === 'GET') {
      const user = await authenticateUser(req);
      if (!user) {
        return sendJson(res, 401, { error: 'Authentication required to view your websites' });
      }

      const rows = db.prepare(`
        SELECT * FROM event_websites 
        WHERE user_id = ? 
        ORDER BY updated_at DESC
      `).all(user.id);

      const websites = rows.map((r) => formatWebsiteRow(r, true));
      return sendJson(res, 200, { websites });
    }

    // GET /api/websites/by-slug/:slug: Public site for visitors (Phase 6 & 13)
    if (pathname.startsWith('/api/websites/by-slug/') && method === 'GET') {
      const slug = decodeURIComponent(pathname.replace('/api/websites/by-slug/', '')).toLowerCase().trim();
      const row = db.prepare('SELECT * FROM event_websites WHERE LOWER(slug) = ? AND status = ?').get(slug, 'published');

      if (!row) {
        return sendJson(res, 404, { error: 'Website not found or not published' });
      }

      // Increment view count in database
      try {
        db.prepare('UPDATE event_websites SET views_count = views_count + 1 WHERE id = ?').run(row.id);
      } catch (_) {}

      // Public visitors MUST NOT see private owner user_id or auth credentials
      return sendJson(res, 200, { website: formatWebsiteRow(row, false) });
    }

    // GET /api/websites/:id: Owner only for private/draft, public only if published
    if (pathname.startsWith('/api/websites/') && method === 'GET' && !pathname.includes('/by-slug/')) {
      const id = pathname.replace('/api/websites/', '');
      const row = db.prepare('SELECT * FROM event_websites WHERE id = ?').get(id);
      if (!row) {
        return sendJson(res, 404, { error: 'Website not found' });
      }

      if (row.status !== 'published') {
        const user = await authenticateUser(req);
        if (!user || user.id !== row.user_id) {
          return sendJson(res, 403, { error: 'Access denied: You do not have permission to view this private site.' });
        }
        return sendJson(res, 200, { website: formatWebsiteRow(row, true) });
      }

      return sendJson(res, 200, { website: formatWebsiteRow(row, false) });
    }

    // POST /api/websites: Create website with server-enforced authenticated ownership
    if (pathname === '/api/websites' && method === 'POST') {
      const user = await authenticateUser(req);
      if (!user) {
        return sendJson(res, 401, { error: 'Authentication required. Please sign in to create a website.' });
      }

      const payload = await parseBody(req);
      const id = `site_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const now = new Date().toISOString();
      const cleanSlug = (payload.slug || `event-${Date.now()}`).toLowerCase().trim();

      // Ensure slug uniqueness
      let finalSlug = cleanSlug;
      const existingSlug = db.prepare('SELECT id FROM event_websites WHERE LOWER(slug) = ?').get(finalSlug);
      if (existingSlug) {
        finalSlug = `${cleanSlug}-${crypto.randomBytes(3).toString('hex')}`;
      }

      // CRITICAL: user_id is strictly user.id, never trusting payload.userId!
      const ownerUserId = user.id;

      db.prepare(`
        INSERT INTO event_websites (
          id, user_id, template_id, event_type, title, slug, status,
          event_data, is_lifetime, views_count, rsvps_count, created_at, updated_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)
      `).run(
        id,
        ownerUserId,
        payload.templateId || 'enrolldesk-01',
        payload.eventType || 'Celebration',
        payload.title || 'My Event Website',
        finalSlug,
        payload.status || 'draft',
        JSON.stringify(payload.eventData || {}),
        payload.isLifetime ? 1 : 0,
        now,
        now,
        payload.expiresAt || null
      );

      const created = db.prepare('SELECT * FROM event_websites WHERE id = ?').get(id);
      return sendJson(res, 201, { website: formatWebsiteRow(created, true) });
    }

    // PUT /api/websites/:id: Update website with strict ownership verification
    if (pathname.startsWith('/api/websites/') && method === 'PUT') {
      const user = await authenticateUser(req);
      if (!user) {
        return sendJson(res, 401, { error: 'Authentication required' });
      }

      const id = pathname.replace('/api/websites/', '');
      const existing = db.prepare('SELECT * FROM event_websites WHERE id = ?').get(id);
      if (!existing) {
        return sendJson(res, 404, { error: 'Website not found' });
      }

      // Enforce: authenticated_user.id == site.owner_user_id
      if (existing.user_id !== user.id) {
        return sendJson(res, 403, { error: 'Access denied: You do not own this website.' });
      }

      const updates = await parseBody(req);
      const now = new Date().toISOString();

      let eventDataStr = existing.event_data;
      if (updates.eventData) {
        const prevData = JSON.parse(existing.event_data || '{}');
        eventDataStr = JSON.stringify({ ...prevData, ...updates.eventData });
      }

      const newTitle = updates.title || existing.title;
      const newStatus = updates.status || existing.status;
      const newEventType = updates.eventType || existing.event_type;
      const newSlug = updates.slug ? updates.slug.toLowerCase().trim() : existing.slug;

      // Note: user_id is NEVER updated, preventing client ownership changes
      db.prepare(`
        UPDATE event_websites SET
          title = ?,
          status = ?,
          event_type = ?,
          slug = ?,
          event_data = ?,
          updated_at = ?
        WHERE id = ?
      `).run(newTitle, newStatus, newEventType, newSlug, eventDataStr, now, id);

      const updated = db.prepare('SELECT * FROM event_websites WHERE id = ?').get(id);
      return sendJson(res, 200, { website: formatWebsiteRow(updated, true) });
    }

    // DELETE /api/websites/:id: Delete website with strict ownership verification
    if (pathname.startsWith('/api/websites/') && method === 'DELETE') {
      const user = await authenticateUser(req);
      if (!user) {
        return sendJson(res, 401, { error: 'Authentication required' });
      }

      const id = pathname.replace('/api/websites/', '');
      const existing = db.prepare('SELECT * FROM event_websites WHERE id = ?').get(id);
      if (!existing) {
        return sendJson(res, 404, { error: 'Website not found' });
      }

      if (existing.user_id !== user.id) {
        return sendJson(res, 403, { error: 'Access denied: You do not own this website.' });
      }

      db.prepare('DELETE FROM event_websites WHERE id = ?').run(id);
      return sendJson(res, 200, { success: true });
    }

    /* ========================================================
       4. SAVED DRAFTS SYSTEM (PHASE 5)
       ======================================================== */
    // GET /api/drafts: Fetch drafts owned by authenticated user
    if (pathname === '/api/drafts' && method === 'GET') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const rows = db.prepare('SELECT * FROM drafts WHERE user_id = ? ORDER BY updated_at DESC').all(user.id);
      const drafts = rows.map((r) => ({
        id: r.id,
        siteId: r.site_id,
        userId: r.user_id,
        templateId: r.template_id,
        title: r.title,
        slug: r.slug,
        eventType: r.event_type,
        eventData: JSON.parse(r.event_data || '{}'),
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
      return sendJson(res, 200, { drafts });
    }

    // POST /api/drafts: Save draft with authenticated user ownership
    if (pathname === '/api/drafts' && method === 'POST') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const payload = await parseBody(req);
      const now = new Date().toISOString();
      const draftId = payload.id || `draft_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

      // Check if draft already exists
      const existing = payload.id ? db.prepare('SELECT * FROM drafts WHERE id = ?').get(payload.id) : null;
      if (existing && existing.user_id !== user.id) {
        return sendJson(res, 403, { error: 'Access denied: You do not own this draft.' });
      }

      if (existing) {
        db.prepare(`
          UPDATE drafts SET
            title = ?,
            template_id = ?,
            slug = ?,
            event_type = ?,
            event_data = ?,
            site_id = ?,
            updated_at = ?
          WHERE id = ?
        `).run(
          payload.title || existing.title,
          payload.templateId || existing.template_id,
          payload.slug || existing.slug,
          payload.eventType || existing.event_type,
          JSON.stringify(payload.eventData || {}),
          payload.siteId || existing.site_id,
          now,
          existing.id
        );
      } else {
        db.prepare(`
          INSERT INTO drafts (id, site_id, user_id, template_id, title, slug, event_type, event_data, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)
        `).run(
          draftId,
          payload.siteId || null,
          user.id,
          payload.templateId || 'keepsake-birthday-scrapbook',
          payload.title || 'Untitled Event Draft',
          payload.slug || null,
          payload.eventType || 'Celebration',
          JSON.stringify(payload.eventData || {}),
          now,
          now
        );
      }

      const saved = db.prepare('SELECT * FROM drafts WHERE id = ?').get(existing ? existing.id : draftId);
      return sendJson(res, 200, {
        draft: {
          id: saved.id,
          siteId: saved.site_id,
          userId: saved.user_id,
          templateId: saved.template_id,
          title: saved.title,
          slug: saved.slug,
          eventType: saved.event_type,
          eventData: JSON.parse(saved.event_data || '{}'),
          status: saved.status,
          createdAt: saved.created_at,
          updatedAt: saved.updated_at,
        },
      });
    }

    // GET /api/drafts/:id
    if (pathname.startsWith('/api/drafts/') && method === 'GET') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const id = pathname.replace('/api/drafts/', '');
      const draft = db.prepare('SELECT * FROM drafts WHERE id = ?').get(id);
      if (!draft) return sendJson(res, 404, { error: 'Draft not found' });
      if (draft.user_id !== user.id) return sendJson(res, 403, { error: 'Access denied: You do not own this draft' });

      return sendJson(res, 200, {
        draft: {
          id: draft.id,
          siteId: draft.site_id,
          userId: draft.user_id,
          templateId: draft.template_id,
          title: draft.title,
          slug: draft.slug,
          eventType: draft.event_type,
          eventData: JSON.parse(draft.event_data || '{}'),
          status: draft.status,
          createdAt: draft.created_at,
          updatedAt: draft.updated_at,
        },
      });
    }

    // DELETE /api/drafts/:id
    if (pathname.startsWith('/api/drafts/') && method === 'DELETE') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const id = pathname.replace('/api/drafts/', '');
      const draft = db.prepare('SELECT * FROM drafts WHERE id = ?').get(id);
      if (!draft) return sendJson(res, 404, { error: 'Draft not found' });
      if (draft.user_id !== user.id) return sendJson(res, 403, { error: 'Access denied: You do not own this draft' });

      db.prepare('DELETE FROM drafts WHERE id = ?').run(id);
      return sendJson(res, 200, { success: true });
    }

    /* ========================================================
       5. 1-MONTH PREMIUM SUBSCRIPTIONS (PHASES 7, 8, 9, 10, 11)
       ======================================================== */
    // GET /api/subscriptions/me: Check user's subscription entitlement
    if (pathname === '/api/subscriptions/me' && method === 'GET') {
      const user = await authenticateUser(req);
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });

      const sub = db.prepare(`
        SELECT * FROM subscriptions 
        WHERE user_id = ? 
        ORDER BY created_at DESC LIMIT 1
      `).get(user.id);

      if (!sub) {
        return sendJson(res, 200, {
          hasSubscription: false,
          isPremiumActive: false,
          plan: 'free',
          message: 'No active subscription found',
        });
      }

      const now = new Date();
      const expiresAt = new Date(sub.expires_at);
      const isStillValid = (sub.payment_status === 'active' || sub.payment_status === 'completed') && now < expiresAt;

      // Automatically mark expired if time has elapsed
      if (!isStillValid && sub.payment_status === 'active') {
        db.prepare("UPDATE subscriptions SET payment_status = 'expired', updated_at = ? WHERE id = ?").run(
          now.toISOString(),
          sub.id
        );
        sub.payment_status = 'expired';
      }

      return sendJson(res, 200, {
        hasSubscription: true,
        isPremiumActive: isStillValid,
        plan: sub.plan,
        startedAt: sub.started_at,
        expiresAt: sub.expires_at,
        paymentStatus: sub.payment_status,
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

      // Check for duplicate transaction claim
      const duplicate = db.prepare('SELECT id FROM payment_transactions WHERE transaction_reference = ?').get(cleanRef);
      if (duplicate) {
        return sendJson(res, 400, { error: 'This transaction reference has already been claimed or verified.' });
      }

      const now = new Date();
      // Server calculates exactly 1 billing month (30 days)
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const txnId = `txn_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const subId = `sub_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

      // Insert transaction
      db.prepare(`
        INSERT INTO payment_transactions (
          id, user_id, subscription_id, transaction_reference, amount, currency, status, verified_at, created_at
        ) VALUES (?, ?, ?, ?, ?, 'INR', 'verified', ?, ?)
      `).run(txnId, user.id, subId, cleanRef, Number(amount) || 499, now.toISOString(), now.toISOString());

      // Insert 1-Month Subscription
      db.prepare(`
        INSERT INTO subscriptions (
          id, user_id, plan, payment_status, started_at, expires_at, provider_payment_id, amount, currency, created_at, updated_at
        ) VALUES (?, ?, ?, 'active', ?, ?, ?, ?, 'INR', ?, ?)
      `).run(
        subId,
        user.id,
        plan,
        now.toISOString(),
        expiresAt.toISOString(),
        cleanRef,
        Number(amount) || 499,
        now.toISOString(),
        now.toISOString()
      );

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
       6. RSVPS STORAGE (DATABASE PERSISTENCE)
       ======================================================== */
    if (pathname === '/api/rsvps' && method === 'POST') {
      const payload = await parseBody(req);
      const id = `rsvp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const now = new Date().toISOString();
      const slug = (payload.slug || '').toLowerCase().trim();

      db.prepare(`
        INSERT INTO rsvps (
          id, website_id, slug, guest_name, guest_email, attendance,
          meal_preference, dietary_notes, song_request, plus_ones, custom_fields, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        payload.websiteId || null,
        slug,
        payload.guestName || 'Guest',
        payload.guestEmail || '',
        payload.attendance || 'accept',
        payload.mealPreference || null,
        payload.dietaryNotes || null,
        payload.songRequest || null,
        Number(payload.plusOnes) || 0,
        JSON.stringify(payload.customFields || {}),
        now
      );

      // Increment RSVP count on the website
      if (slug) {
        db.prepare('UPDATE event_websites SET rsvps_count = rsvps_count + 1 WHERE LOWER(slug) = ?').run(slug);
      }

      return sendJson(res, 201, { success: true, id, message: 'RSVP recorded in database' });
    }

    if (pathname.startsWith('/api/rsvps/') && method === 'GET') {
      const slug = decodeURIComponent(pathname.replace('/api/rsvps/', '')).toLowerCase().trim();
      const rows = db.prepare('SELECT * FROM rsvps WHERE LOWER(slug) = ? ORDER BY created_at DESC').all(slug);

      const rsvps = rows.map((r) => ({
        id: r.id,
        websiteId: r.website_id,
        slug: r.slug,
        guestName: r.guest_name,
        guestEmail: r.guest_email,
        attendance: r.attendance,
        mealPreference: r.meal_preference,
        dietaryNotes: r.dietary_notes,
        songRequest: r.song_request,
        plusOnes: r.plus_ones,
        submittedAt: r.created_at,
      }));

      return sendJson(res, 200, { rsvps });
    }

    /* ========================================================
       7. STUDENT PORTAL / HUB DATA (DATABASE PERSISTENCE)
       ======================================================== */
    if (pathname.startsWith('/api/hubs/') && method === 'GET') {
      const slug = decodeURIComponent(pathname.replace('/api/hubs/', '')).toLowerCase().trim();
      const row = db.prepare('SELECT * FROM portal_hubs WHERE LOWER(slug) = ?').get(slug);

      if (!row) {
        return sendJson(res, 200, {
          slug,
          hubData: null,
          superlativeVotes: {},
          studyGroups: [],
        });
      }

      return sendJson(res, 200, {
        slug: row.slug,
        hubData: JSON.parse(row.hub_data || '{}'),
        superlativeVotes: JSON.parse(row.superlative_votes || '{}'),
        studyGroups: JSON.parse(row.study_groups || '[]'),
      });
    }

    if (pathname.startsWith('/api/hubs/') && method === 'PUT') {
      const slug = decodeURIComponent(pathname.replace('/api/hubs/', '')).toLowerCase().trim();
      const { hubData, websiteId } = await parseBody(req);
      const now = new Date().toISOString();

      const existing = db.prepare('SELECT * FROM portal_hubs WHERE LOWER(slug) = ?').get(slug);

      if (existing) {
        db.prepare(`
          UPDATE portal_hubs SET
            hub_data = ?,
            updated_at = ?
          WHERE LOWER(slug) = ?
        `).run(JSON.stringify(hubData || {}), now, slug);
      } else {
        db.prepare(`
          INSERT INTO portal_hubs (slug, website_id, hub_data, superlative_votes, study_groups, created_at, updated_at)
          VALUES (?, ?, ?, '{}', '[]', ?, ?)
        `).run(slug, websiteId || null, JSON.stringify(hubData || {}), now, now);
      }

      return sendJson(res, 200, { success: true, message: 'Portal hub saved to database' });
    }

    if (pathname.startsWith('/api/hubs/') && pathname.endsWith('/vote') && method === 'POST') {
      const slug = decodeURIComponent(pathname.replace('/api/hubs/', '').replace('/vote', '')).toLowerCase().trim();
      const { superlativeKey } = await parseBody(req);
      const now = new Date().toISOString();

      let row = db.prepare('SELECT * FROM portal_hubs WHERE LOWER(slug) = ?').get(slug);
      let votes = {};

      if (row && row.superlative_votes) {
        try {
          votes = JSON.parse(row.superlative_votes);
        } catch (_) {
          votes = {};
        }
      }

      if (superlativeKey) {
        votes[superlativeKey] = (votes[superlativeKey] || 0) + 1;
      }

      if (row) {
        db.prepare('UPDATE portal_hubs SET superlative_votes = ?, updated_at = ? WHERE LOWER(slug) = ?').run(
          JSON.stringify(votes),
          now,
          slug
        );
      } else {
        db.prepare(`
          INSERT INTO portal_hubs (slug, website_id, hub_data, superlative_votes, study_groups, created_at, updated_at)
          VALUES (?, NULL, '{}', ?, '[]', ?, ?)
        `).run(slug, JSON.stringify(votes), now, now);
      }

      return sendJson(res, 200, { success: true, votes });
    }

    return sendJson(res, 404, { error: 'API route not found' });
  } catch (error) {
    console.error('[API Router Error]', error);
    return sendJson(res, 500, { error: error.message || 'Internal server error' });
  }
}
