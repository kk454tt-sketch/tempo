import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables from .env if present
try {
  const envPath = path.join(projectRoot, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
      }
    }
  }
} catch {
  // Environment variables are configured by host in production
}

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'tempo-fbfbb';

if (getApps().length === 0) {
  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      const raw = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed.type === 'service_account') {
        initializeApp({
          credential: cert(parsed),
          projectId: FIREBASE_PROJECT_ID,
        });
      } else {
        initializeApp({
          credential: applicationDefault(),
          projectId: FIREBASE_PROJECT_ID,
        });
      }
    } else {
      initializeApp({
        credential: applicationDefault(),
        projectId: FIREBASE_PROJECT_ID,
      });
    }
  } catch (e) {
    try {
      initializeApp({ projectId: FIREBASE_PROJECT_ID });
    } catch (_) {}
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
export { FieldValue, Timestamp };
