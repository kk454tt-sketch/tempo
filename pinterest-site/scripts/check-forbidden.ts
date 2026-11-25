/**
 * npm run check:data
 * Fails if any made-up Stitch content (STRICT DATA RULE) appears in the code base.
 * design/stitch, node_modules, .next and this file are skipped.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const FORBIDDEN = [
  "Aura Studio",
  "mechanical keyboard",
  "desk lamp",
  "pour over",
  "leather wallet",
  "charger pad",
  "24,892",
  "Top country: India",
  "lh3.googleusercontent.com",
];

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", ".vercel", "stitch"]);
const SELF = join("scripts", "check-forbidden.ts");
const TEXT_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|css|md|sql|html|txt|env|example)$/i;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(entry) && !entry.startsWith("stitch_")) walk(full, out);
    } else if (TEXT_EXT.test(entry) || entry.startsWith(".env")) {
      out.push(full);
    }
  }
  return out;
}

const root = process.cwd();
const hits: string[] = [];
for (const file of walk(root)) {
  const rel = relative(root, file);
  if (rel === SELF) continue;
  const text = readFileSync(file, "utf8").toLowerCase();
  for (const needle of FORBIDDEN) {
    if (text.includes(needle.toLowerCase())) hits.push(`${rel}: "${needle}"`);
  }
}

if (hits.length > 0) {
  console.error("✖ Forbidden sample content found:\n" + hits.map((h) => `  ${h}`).join("\n"));
  process.exit(1);
}
console.log("✔ No forbidden sample content found.");
