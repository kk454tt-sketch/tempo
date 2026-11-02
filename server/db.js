import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'tempo.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrency
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {
  console.warn('SQLite PRAGMA setup warning:', e.message);
}

// 1. Initialize Core Tables (Preserving existing schema & adding hardening tables)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    name TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    profile_data TEXT DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS event_websites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    event_data TEXT NOT NULL,
    is_lifetime INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    rsvps_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    expires_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    site_id TEXT,
    user_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT,
    event_type TEXT DEFAULT '',
    event_data TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'premium-pro',
    payment_status TEXT NOT NULL DEFAULT 'active',
    started_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    provider_payment_id TEXT,
    amount NUMERIC DEFAULT 499.00,
    currency TEXT DEFAULT 'INR',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    subscription_id TEXT,
    transaction_reference TEXT UNIQUE NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'verified',
    verified_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS rsvps (
    id TEXT PRIMARY KEY,
    website_id TEXT,
    slug TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    guest_email TEXT,
    attendance TEXT DEFAULT 'accept',
    meal_preference TEXT,
    dietary_notes TEXT,
    song_request TEXT,
    plus_ones INTEGER DEFAULT 0,
    custom_fields TEXT DEFAULT '{}',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS portal_hubs (
    slug TEXT PRIMARY KEY,
    website_id TEXT,
    hub_data TEXT NOT NULL,
    superlative_votes TEXT DEFAULT '{}',
    study_groups TEXT DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_websites_user ON event_websites(user_id);
  CREATE INDEX IF NOT EXISTS idx_websites_slug ON event_websites(slug);
  CREATE INDEX IF NOT EXISTS idx_drafts_user ON drafts(user_id);
  CREATE INDEX IF NOT EXISTS idx_drafts_site ON drafts(site_id);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_rsvps_slug ON rsvps(slug);
`);

// Backfill profiles for any existing users
try {
  const users = db.prepare('SELECT id, name, avatar_url, created_at, updated_at FROM users').all();
  for (const u of users) {
    const existingProf = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(u.id);
    if (!existingProf) {
      db.prepare(`
        INSERT INTO profiles (id, user_id, full_name, avatar_url, bio, profile_data, created_at, updated_at)
        VALUES (?, ?, ?, ?, '', '{}', ?, ?)
      `).run(`prof_${u.id}`, u.id, u.name || 'Creator', u.avatar_url || '', u.created_at, u.updated_at);
    }
  }
} catch (e) {
  console.warn('Profile backfill warning:', e.message);
}

console.log('[Tempo Database] SQLite Database ready at:', dbPath);
