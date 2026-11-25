/**
 * npm run design:sync
 *  1. Copies the Stitch export (./stitch_affhub_discovery_brand_design, or the path given as the first
 *     argument) into design/stitch. An existing design/stitch is never overwritten or edited.
 *  2. Reads the Tailwind config embedded in the code.html files and writes design/tailwind-tokens.json,
 *     which tailwind.config.ts consumes (colors, fontSize, borderRadius, spacing, ...).
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = process.cwd();
const SOURCE_NAME = "stitch_affhub_discovery_brand_design";
const DEST = join(ROOT, "design", "stitch");
const TOKENS_OUT = join(ROOT, "design", "tailwind-tokens.json");
const FONT_VAR = "var(--font-plus-jakarta-sans)";

function fail(message: string): never {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

function walk(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, found);
    else if (entry === "code.html") found.push(full);
  }
  return found;
}

/** Returns the object literal that follows `tailwind.config =`, evaluated. */
function extractConfig(html: string): Record<string, any> | null {
  const marker = html.indexOf("tailwind.config");
  if (marker === -1) return null;
  const start = html.indexOf("{", marker);
  if (start === -1) return null;

  let depth = 0;
  let quote: string | null = null;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
    } else if (ch === "/" && html[i + 1] === "/") {
      const end = html.indexOf("\n", i);
      i = end === -1 ? html.length : end;
    } else if (ch === "/" && html[i + 1] === "*") {
      const end = html.indexOf("*/", i + 2);
      i = end === -1 ? html.length : end + 1;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const literal = html.slice(start, i + 1);
        // The file is the owner's own Stitch export; it is a plain object literal.
        return new Function(`return (${literal});`)() as Record<string, any>;
      }
    }
  }
  return null;
}

function extractPlugins(html: string): string[] {
  const match = html.match(/cdn\.tailwindcss\.com\?plugins=([^"'&\s]+)/);
  return match?.[1] ? match[1].split(",").filter(Boolean) : [];
}

/** Every font family from the export is mapped to Plus Jakarta Sans (loaded with next/font). */
function remapFonts(fontFamily: Record<string, unknown> | undefined): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const key of Object.keys(fontFamily ?? {})) {
    out[key] = [FONT_VAR, "ui-sans-serif", "system-ui", "sans-serif"];
  }
  return out;
}

function main() {
  // 1) Copy the export
  if (existsSync(join(DEST, "affhub", "DESIGN.md"))) {
    console.log("• design/stitch already exists, left untouched.");
  } else {
    const source = resolve(ROOT, process.argv[2] ?? SOURCE_NAME);
    if (!existsSync(source)) {
      fail(
        `Cannot find the Stitch export. Put the folder "${SOURCE_NAME}" in the project root ` +
          `(or pass its path: npm run design:sync -- <path>).`,
      );
    }
    mkdirSync(DEST, { recursive: true });
    cpSync(source, DEST, { recursive: true });
    console.log(`✔ Copied ${relative(ROOT, source)} to design/stitch (read-only source of truth: do not edit).`);
  }
  if (!existsSync(join(DEST, "affhub", "DESIGN.md"))) {
    console.warn("! design/stitch/affhub/DESIGN.md was not found. Check that the export has the expected structure.");
  }

  // 2) Tailwind tokens
  const pages = walk(DEST);
  if (pages.length === 0) fail("No code.html files found in design/stitch.");

  let chosen: { file: string; cfg: Record<string, any>; html: string } | null = null;
  const seen = new Set<string>();
  for (const file of pages) {
    const html = readFileSync(file, "utf8");
    const cfg = extractConfig(html);
    if (!cfg) continue;
    seen.add(JSON.stringify(cfg));
    chosen ??= { file, cfg, html };
  }
  if (!chosen) fail("None of the code.html files contains a `tailwind.config = { ... }` block.");
  if (seen.size > 1) {
    console.warn(
      `! ${seen.size} different Tailwind configs found across the pages. Using ${relative(ROOT, chosen.file)}; compare the others by hand.`,
    );
  }

  const theme: Record<string, any> = chosen.cfg.theme ?? {};
  const { extend = {}, ...rest } = theme;
  if (rest.fontFamily) rest.fontFamily = remapFonts(rest.fontFamily);

  const tokens = {
    source: relative(ROOT, chosen.file).split("\\").join("/"),
    darkMode: typeof chosen.cfg.darkMode === "string" ? chosen.cfg.darkMode : null,
    plugins: extractPlugins(chosen.html),
    theme: rest,
    extend: { ...extend, fontFamily: remapFonts(extend.fontFamily) },
  };
  writeFileSync(TOKENS_OUT, `${JSON.stringify(tokens, null, 2)}\n`);

  const count = (key: string) => Object.keys(extend[key] ?? rest[key] ?? {}).length;
  console.log(`✔ Wrote design/tailwind-tokens.json from ${tokens.source}`);
  console.log(
    `  colors: ${count("colors")}, fontSize: ${count("fontSize")}, borderRadius: ${count("borderRadius")}, spacing: ${count("spacing")}, plugins: ${tokens.plugins.join(", ") || "none"}`,
  );
  if (count("colors") === 0 && count("fontSize") === 0) {
    console.warn("! The config has no colors or fontSize. Check the export before building pages.");
  }
  console.log("\nNext: read design/stitch/affhub/DESIGN.md, then recreate each page from its code.html and screen.png.");
}

main();
