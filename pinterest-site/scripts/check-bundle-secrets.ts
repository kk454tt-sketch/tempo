/**
 * npm run check:bundle   (run AFTER npm run build)
 * Fails if anything in .next/static (what browsers download) contains a secret:
 *  - the exact value of SUPABASE_SERVICE_ROLE_KEY / CRON_SECRET / RATE_LIMIT_SALT /
 *    UPSTASH_REDIS_REST_TOKEN / SENTRY auth if they are set in this shell or .env.local
 *  - any Supabase "sb_secret_" key
 *  - any JWT whose payload says role = service_role
 *  - a postgres:// connection string
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { loadEnv } from "./lib/env";

loadEnv();

const ROOT = join(process.cwd(), ".next", "static");
const SECRET_ENV = ["SUPABASE_SERVICE_ROLE_KEY", "CRON_SECRET", "RATE_LIMIT_SALT", "UPSTASH_REDIS_REST_TOKEN", "SUPABASE_DB_URL"];
const secrets = SECRET_ENV.map((n) => [n, process.env[n]] as const).filter(([, v]) => v && v.length >= 8) as [string, string][];

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(js|css|html|json|map|txt)$/.test(name)) yield p;
  }
}

function jwtRole(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

try {
  statSync(ROOT);
} catch {
  console.error(".next/static not found. Run `npm run build` first.");
  process.exit(1);
}

const findings: string[] = [];
let files = 0;
for (const file of walk(ROOT)) {
  files++;
  const text = readFileSync(file, "utf8");
  const rel = file.slice(process.cwd().length + 1);
  for (const [name, value] of secrets) if (text.includes(value)) findings.push(`${rel}: contains the value of ${name}`);
  if (/sb_secret_[A-Za-z0-9_-]{10,}/.test(text)) findings.push(`${rel}: contains an sb_secret_ key`);
  if (/postgres(ql)?:\/\/[^\s"'`]+:[^\s"'`]+@/.test(text)) findings.push(`${rel}: contains a database connection string`);
  for (const m of text.matchAll(/eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g)) {
    if (jwtRole(m[0]) === "service_role") findings.push(`${rel}: contains a service_role JWT`);
  }
}

console.log(`Scanned ${files} files in .next/static (${secrets.length} secret values from env checked, plus pattern checks).`);
if (findings.length) {
  console.error("FAIL: secrets found in client bundles:\n" + [...new Set(findings)].map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}
console.log("PASS: no service-role key or other server secret in client bundles.");
