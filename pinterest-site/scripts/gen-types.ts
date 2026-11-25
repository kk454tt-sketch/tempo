/**
 * npm run types
 * Generates types/database.ts from the live database with the Supabase CLI.
 * Runs the same way on Windows, macOS and Linux, reads SUPABASE_DB_URL from .env.local,
 * and only overwrites the file when generation succeeds (a plain shell redirect would
 * leave an empty file on failure).
 *
 * Needs the Supabase CLI:  npm i -D supabase
 * Some CLI versions need Docker running for --db-url.
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { loadEnv, requireEnv } from "./load-env";

loadEnv();
const dbUrl = requireEnv("SUPABASE_DB_URL");
const target = resolve(process.cwd(), "types/database.ts");

// The URL goes in through an environment variable so passwords with special characters
// never have to be quoted on the command line.
const command =
  process.platform === "win32"
    ? 'npx supabase gen types typescript --db-url "%SUPABASE_DB_URL%"'
    : 'npx supabase gen types typescript --db-url "$SUPABASE_DB_URL"';

try {
  const output = execSync(command, {
    env: { ...process.env, SUPABASE_DB_URL: dbUrl },
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    stdio: ["ignore", "pipe", "inherit"],
  });

  if (!output.includes("export type Database")) {
    throw new Error("The CLI output does not look like generated types.");
  }

  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, output);
  console.log(`Wrote ${target}`);
} catch (error) {
  console.error(`Type generation failed: ${error instanceof Error ? error.message : String(error)}`);
  console.error("types/database.ts was left unchanged.");
  process.exit(1);
}
