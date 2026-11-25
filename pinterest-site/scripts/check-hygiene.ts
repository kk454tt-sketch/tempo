/**
 * npm run check:hygiene
 * Fails on leftover fake/sample data and on third-party font hosts in source.
 * e2e/, tests, docs and this script are excluded (they may mention the strings).
 */
import { execSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const FAKE_PATTERNS: [RegExp, string][] = [
  [/lorem ipsum|dolor sit amet/i, "lorem ipsum"],
  [/\b(sample|dummy|fake|mock) (product|data|item|user|name|text)s?\b/i, "sample/dummy/fake wording"],
  [/\b(john|jane) doe\b/i, "John/Jane Doe"],
  [/\bexample\.com\b/i, "example.com"],
  [/placehold\.co|via\.placeholder\.com|picsum\.photos|images\.unsplash\.com|dummyimage\.com/i, "stock/placeholder image host"],
  [/googleusercontent\.com\/aida/i, "Stitch export image URL"],
];
const EXTERNAL_FONT_PATTERNS: [RegExp, string][] = [
  [/fonts\.googleapis\.com|fonts\.gstatic\.com/i, "Google Fonts host (self-host via npm instead)"],
];

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "backups", "coverage", "playwright-report", "test-results", "e2e", ".vercel", ".github"]);
const SKIP_FILES = /(\.test\.|\.spec\.|^README|\.md$|package-lock\.json$|check-hygiene\.ts$|\.env\.example$)/;
const EXT = /\.(ts|tsx|js|jsx|mjs|cjs|css|json|html|sql|mdx)$/;

function listFiles(): string[] {
  try {
    return execSync("git ls-files", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n").filter(Boolean);
  } catch {
    const out: string[] = [];
    const walk = (d: string) => {
      for (const n of readdirSync(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) {
          if (!SKIP_DIRS.has(n)) walk(p);
        } else out.push(relative(process.cwd(), p));
      }
    };
    walk(process.cwd());
    return out;
  }
}

const findings: string[] = [];
for (const file of listFiles()) {
  const parts = file.split(/[\\/]/);
  if (parts.some((p) => SKIP_DIRS.has(p)) || SKIP_FILES.test(parts[parts.length - 1]) || !EXT.test(file)) continue;
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  text.split(/\r?\n/).forEach((line, i) => {
    for (const [re, label] of [...FAKE_PATTERNS, ...EXTERNAL_FONT_PATTERNS]) {
      if (re.test(line)) findings.push(`${file}:${i + 1}  ${label}  ->  ${line.trim().slice(0, 100)}`);
    }
  });
}

if (findings.length) {
  console.error(`FAIL: ${findings.length} hygiene finding(s):\n` + findings.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}
console.log("PASS: no fake/sample data strings or third-party font hosts in tracked source.");
