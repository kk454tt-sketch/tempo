import { db } from './db.js';

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

  try {
    /* ========================================================
       1. AUTHENTICATION & USER MANAGEMENT
       ======================================================== */
    if (pathname === '/api/auth/register' && method === 'POST') {
      const { name, email, password } = await parseBody(req);
      if (!email) {
        return sendJson(res, 400, { error: 'Email is required' });
      }

      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
      if (existing) {
        return sendJson(res, 400, { error: 'An account with this email already exists' });
      }

      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO users (id, email, password, name, avatar_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, email.toLowerCase().trim(), password || '', name || email.split('@')[0], '', now, now);

      const user = {
        id: userId,
        email: email.toLowerCase().trim(),
        name: name || email.split('@')[0],
        avatarUrl: '',
        createdAt: now,
      };
      return sendJson(res, 200, { user });
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const { email, password } = await parseBody(req);
      if (!email) {
        return sendJson(res, 400, { error: 'Email is required' });
      }

      const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
      if (!userRow) {
        // Auto-register convenience for dev/demo if password provided
        const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date().toISOString();
        db.prepare(`
          INSERT INTO users (id, email, password, name, avatar_url, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, email.toLowerCase().trim(), password || '', email.split('@')[0], '', now, now);

        return sendJson(res, 200, {
          user: {
            id: userId,
            email: email.toLowerCase().trim(),
            name: email.split('@')[0],
            avatarUrl: '',
            createdAt: now,
          },
        });
      }

      return sendJson(res, 200, {
        user: {
          id: userRow.id,
          email: userRow.email,
          name: userRow.name,
          avatarUrl: userRow.avatar_url || '',
          createdAt: userRow.created_at,
        },
      });
    }

    if (pathname === '/api/auth/google' && method === 'POST') {
      const { email, name, avatarUrl } = await parseBody(req);
      const cleanEmail = (email || 'google_user@tempo.atelier').toLowerCase().trim();
      let userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

      if (!userRow) {
        const userId = `usr_google_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date().toISOString();
        db.prepare(`
          INSERT INTO users (id, email, password, name, avatar_url, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, cleanEmail, '', name || 'Google Creator', avatarUrl || '', now, now);

        userRow = {
          id: userId,
          email: cleanEmail,
          name: name || 'Google Creator',
          avatar_url: avatarUrl || '',
          created_at: now,
        };
      }

      return sendJson(res, 200, {
        user: {
          id: userRow.id,
          email: userRow.email,
          name: userRow.name,
          avatarUrl: userRow.avatar_url || '',
          createdAt: userRow.created_at,
        },
      });
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      const userId = url.searchParams.get('userId');
      if (!userId) {
        return sendJson(res, 400, { error: 'userId is required' });
      }
      const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      if (!userRow) {
        return sendJson(res, 404, { error: 'User not found' });
      }
      return sendJson(res, 200, {
        user: {
          id: userRow.id,
          email: userRow.email,
          name: userRow.name,
          avatarUrl: userRow.avatar_url || '',
          createdAt: userRow.created_at,
        },
      });
    }

    /* ========================================================
       2. EVENT WEBSITES MANAGEMENT (STRICT USER ISOLATION)
       ======================================================== */
    // GET /api/websites?userId=...
    if (pathname === '/api/websites' && method === 'GET') {
      const userId = url.searchParams.get('userId');
      if (!userId) {
        return sendJson(res, 200, { websites: [] });
      }

      const rows = db.prepare(`
        SELECT * FROM event_websites 
        WHERE user_id = ? 
        ORDER BY updated_at DESC
      `).all(userId);

      const websites = rows.map(formatWebsiteRow);
      return sendJson(res, 200, { websites });
    }

    // GET /api/websites/by-slug/:slug (Public site for guests visiting /e/:slug)
    if (pathname.startsWith('/api/websites/by-slug/') && method === 'GET') {
      const slug = decodeURIComponent(pathname.replace('/api/websites/by-slug/', '')).toLowerCase().trim();
      const row = db.prepare('SELECT * FROM event_websites WHERE LOWER(slug) = ?').get(slug);

      if (!row) {
        return sendJson(res, 404, { error: 'Website not found' });
      }

      // Increment view count in database
      try {
        db.prepare('UPDATE event_websites SET views_count = views_count + 1 WHERE id = ?').run(row.id);
      } catch (e) {
        // ignore view count race
      }

      return sendJson(res, 200, { website: formatWebsiteRow(row) });
    }

    // GET /api/websites/:id
    if (pathname.startsWith('/api/websites/') && method === 'GET') {
      const id = pathname.replace('/api/websites/', '');
      const row = db.prepare('SELECT * FROM event_websites WHERE id = ?').get(id);
      if (!row) {
        return sendJson(res, 404, { error: 'Website not found' });
      }
      return sendJson(res, 200, { website: formatWebsiteRow(row) });
    }

    // POST /api/websites (Create website)
    if (pathname === '/api/websites' && method === 'POST') {
      const payload = await parseBody(req);
      const id = `site_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();
      const cleanSlug = (payload.slug || `event-${Date.now()}`).toLowerCase().trim();

      // Ensure slug uniqueness
      let finalSlug = cleanSlug;
      const existingSlug = db.prepare('SELECT id FROM event_websites WHERE LOWER(slug) = ?').get(finalSlug);
      if (existingSlug) {
        finalSlug = `${cleanSlug}-${Math.random().toString(36).substring(2, 6)}`;
      }

      db.prepare(`
        INSERT INTO event_websites (
          id, user_id, template_id, event_type, title, slug, status,
          event_data, is_lifetime, views_count, rsvps_count, created_at, updated_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)
      `).run(
        id,
        payload.userId || 'usr_tempo_demo_01',
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
      return sendJson(res, 201, { website: formatWebsiteRow(created) });
    }

    // PUT /api/websites/:id (Update website)
    if (pathname.startsWith('/api/websites/') && method === 'PUT') {
      const id = pathname.replace('/api/websites/', '');
      const existing = db.prepare('SELECT * FROM event_websites WHERE id = ?').get(id);
      if (!existing) {
        return sendJson(res, 404, { error: 'Website not found' });
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
      return sendJson(res, 200, { website: formatWebsiteRow(updated) });
    }

    // DELETE /api/websites/:id
    if (pathname.startsWith('/api/websites/') && method === 'DELETE') {
      const id = pathname.replace('/api/websites/', '');
      const userId = url.searchParams.get('userId');

      if (userId) {
        db.prepare('DELETE FROM event_websites WHERE id = ? AND user_id = ?').run(id, userId);
      } else {
        db.prepare('DELETE FROM event_websites WHERE id = ?').run(id);
      }

      return sendJson(res, 200, { success: true });
    }

    /* ========================================================
       3. RSVPS STORAGE (DATABASE PERSISTENCE)
       ======================================================== */
    if (pathname === '/api/rsvps' && method === 'POST') {
      const payload = await parseBody(req);
      const id = `rsvp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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
       4. STUDENT PORTAL / HUB DATA (DATABASE PERSISTENCE)
       ======================================================== */
    // GET /api/hubs/:slug
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

    // PUT /api/hubs/:slug
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

      // Also sync into event_websites.event_data if website exists
      const siteRow = db.prepare('SELECT * FROM event_websites WHERE LOWER(slug) = ?').get(slug);
      if (siteRow) {
        const eventData = JSON.parse(siteRow.event_data || '{}');
        eventData.studentHub = { ...(eventData.studentHub || {}), ...hubData };
        db.prepare('UPDATE event_websites SET event_data = ?, updated_at = ? WHERE id = ?').run(
          JSON.stringify(eventData),
          now,
          siteRow.id
        );
      }

      return sendJson(res, 200, { success: true, message: 'Portal hub saved to database' });
    }

    // POST /api/hubs/:slug/vote (Superlative Poll Vote)
    if (pathname.startsWith('/api/hubs/') && pathname.endsWith('/vote') && method === 'POST') {
      const slug = decodeURIComponent(pathname.replace('/api/hubs/', '').replace('/vote', '')).toLowerCase().trim();
      const { superlativeKey } = await parseBody(req);
      const now = new Date().toISOString();

      let row = db.prepare('SELECT * FROM portal_hubs WHERE LOWER(slug) = ?').get(slug);
      let votes = {};

      if (row && row.superlative_votes) {
        try {
          votes = JSON.parse(row.superlative_votes);
        } catch {
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
          VALUES (?, null, '{}', ?, '[]', ?, ?)
        `).run(slug, JSON.stringify(votes), now, now);
      }

      return sendJson(res, 200, { success: true, votes });
    }

    // GET /api/hubs/:slug/groups
    if (pathname.startsWith('/api/hubs/') && pathname.endsWith('/groups') && method === 'GET') {
      const slug = decodeURIComponent(pathname.replace('/api/hubs/', '').replace('/groups', '')).toLowerCase().trim();
      const row = db.prepare('SELECT study_groups FROM portal_hubs WHERE LOWER(slug) = ?').get(slug);
      let groups = [];
      if (row && row.study_groups) {
        try {
          groups = JSON.parse(row.study_groups);
        } catch {
          groups = [];
        }
      }
      return sendJson(res, 200, { groups });
    }

    // POST /api/hubs/:slug/groups
    if (pathname.startsWith('/api/hubs/') && pathname.endsWith('/groups') && method === 'POST') {
      const slug = decodeURIComponent(pathname.replace('/api/hubs/', '').replace('/groups', '')).toLowerCase().trim();
      const { groups } = await parseBody(req);
      const now = new Date().toISOString();

      const row = db.prepare('SELECT slug FROM portal_hubs WHERE LOWER(slug) = ?').get(slug);
      if (row) {
        db.prepare('UPDATE portal_hubs SET study_groups = ?, updated_at = ? WHERE LOWER(slug) = ?').run(
          JSON.stringify(groups || []),
          now,
          slug
        );
      } else {
        db.prepare(`
          INSERT INTO portal_hubs (slug, website_id, hub_data, superlative_votes, study_groups, created_at, updated_at)
          VALUES (?, null, '{}', '{}', ?, ?, ?)
        `).run(slug, JSON.stringify(groups || []), now, now);
      }

      return sendJson(res, 200, { success: true });
    }

    // Route not found in API
    return sendJson(res, 404, { error: `API route not found: ${method} ${pathname}` });
  } catch (error) {
    console.error('[Tempo API Error]', error);
    return sendJson(res, 500, { error: error.message || 'Internal Server Error' });
  }
}

function formatWebsiteRow(row) {
  let eventData = {};
  try {
    eventData = JSON.parse(row.event_data || '{}');
  } catch {
    eventData = {};
  }

  return {
    id: row.id,
    userId: row.user_id,
    templateId: row.template_id,
    eventType: row.event_type,
    title: row.title,
    slug: row.slug,
    status: row.status,
    isLifetime: Boolean(row.is_lifetime),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at || null,
    metrics: {
      viewsCount: row.views_count || 0,
      rsvpsCount: row.rsvps_count || 0,
      dietaryCount: 0,
      isGuestListClosed: false,
    },
    eventData,
  };
}
