import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Loads .env.local then .env into process.env (existing variables win). No dotenv needed. */
export function loadEnv(): void {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;

    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      const key = match?.[1];
      const raw = match?.[2];
      if (!key || raw === undefined || process.env[key] !== undefined) continue;

      let value = raw.trim();
      const quoted =
        (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
        (value.startsWith("'") && value.endsWith("'") && value.length >= 2);
      if (quoted) value = value.slice(1, -1);
      else value = value.replace(/\s+#.*$/, "");

      process.env[key] = value;
    }
  }
}

/** Returns an environment variable or exits with a clear message. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Add it to .env.local (see .env.example).`);
    process.exit(1);
  }
  return value;
}
