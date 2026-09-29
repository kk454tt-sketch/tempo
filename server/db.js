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

// 1. Initialize Tables
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
    expires_at TEXT
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
  CREATE INDEX IF NOT EXISTS idx_rsvps_slug ON rsvps(slug);
`);

// 2. Seed Default Demo User if not exists
const checkUser = db.prepare('SELECT id FROM users WHERE id = ?');
const defaultUser = checkUser.get('usr_tempo_demo_01');
if (!defaultUser) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password, name, avatar_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run(
    'usr_tempo_demo_01',
    'creator@tempo.atelier',
    'demo123',
    'Tempo Creator',
    '',
    new Date().toISOString(),
    new Date().toISOString()
  );
}

console.log('[Tempo Database] SQLite Database ready at:', dbPath);
