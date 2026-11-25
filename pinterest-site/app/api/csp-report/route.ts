import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10_000;

/** Strip query/hash so tokens or ids in URLs never reach the logs. */
function clean(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const u = new URL(value);
    return `${u.origin}${u.pathname}`.slice(0, 300);
  } catch {
    return value.slice(0, 120); // e.g. "inline", "eval", "data"
  }
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(RATE_LIMITS.cspReport, request.headers);
  if (limited) return limited;

  const text = (await request.text()).slice(0, MAX_BYTES);
  try {
    const body = JSON.parse(text) as unknown;
    // Legacy report-uri format: { "csp-report": {...} }. Reporting API: [{ body: {...} }].
    const reports: Record<string, unknown>[] = Array.isArray(body)
      ? body.map((r) => ((r as { body?: Record<string, unknown> }).body ?? {}) as Record<string, unknown>)
      : [((body as Record<string, unknown>)["csp-report"] ?? {}) as Record<string, unknown>];

    for (const r of reports.slice(0, 5)) {
      logger.warn("csp.violation", {
        directive: r["violated-directive"] ?? r["effectiveDirective"],
        blocked: clean(r["blocked-uri"] ?? r["blockedURL"]),
        document: clean(r["document-uri"] ?? r["documentURL"]),
        source: clean(r["source-file"] ?? r["sourceFile"]),
        line: r["line-number"] ?? r["lineNumber"],
        disposition: r["disposition"],
      });
    }
  } catch {
    // Malformed report: ignore.
  }
  return new NextResponse(null, { status: 204 });
}
