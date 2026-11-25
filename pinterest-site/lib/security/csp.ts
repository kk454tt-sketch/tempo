/**
 * Content-Security-Policy with a per-request nonce.
 *
 * Mode is controlled by CSP_MODE:
 *   "report-only" (default)  send Content-Security-Policy-Report-Only, nothing is blocked
 *   "enforce"                send Content-Security-Policy
 *   "off"                    send nothing
 * Violations are posted to /api/csp-report (see app/api/csp-report/route.ts).
 * Watch the logs for `csp.violation` for a few days, fix what shows up, then
 * set CSP_MODE=enforce.
 *
 * NOTE: a nonce means every page is rendered per request (no static/ISR HTML).
 * Next.js reads the nonce from the request's CSP header and stamps it on its
 * own scripts automatically.
 *
 * Use it from middleware.ts (see INTEGRATION.md):
 *   return withCsp(request, (requestHeaders) => yourExistingMiddleware(request, requestHeaders));
 */
import { NextResponse, type NextRequest } from "next/server";

export type CspMode = "report-only" | "enforce" | "off";

export function getCspMode(): CspMode {
  const v = (process.env.CSP_MODE ?? "report-only").toLowerCase();
  return v === "enforce" || v === "off" ? v : "report-only";
}

function supabaseOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export function createNonce(): string {
  // btoa works in the Edge runtime (Buffer does not).
  return btoa(crypto.randomUUID());
}

export function buildCsp(nonce: string, opts: { isDev?: boolean } = {}): string {
  const isDev = opts.isDev ?? process.env.NODE_ENV === "development";
  const supabase = supabaseOrigin();

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // 'unsafe-eval' only in dev (React refresh). Add 'strict-dynamic' here if you
    // later load scripts dynamically from other origins; not needed today.
    "script-src": ["'self'", `'nonce-${nonce}'`, ...(isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...(supabase ? [supabase] : [])],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...(supabase ? [supabase] : [])],
    "frame-ancestors": ["'none'"],
    // Extra hardening beyond the brief; remove if one of them gets in your way.
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
    "report-uri": ["/api/csp-report"],
  };

  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

export type CspContext = {
  nonce: string;
  headerName: string | null;
  headerValue: string | null;
  /** Pass to NextResponse.next({ request: { headers: ctx.requestHeaders } }). */
  requestHeaders: Headers;
};

export function createCspContext(request: NextRequest): CspContext {
  const mode = getCspMode();
  const nonce = createNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  if (mode === "off") return { nonce, headerName: null, headerValue: null, requestHeaders };

  const headerName = mode === "enforce" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";
  const headerValue = buildCsp(nonce);
  // Next.js looks for the nonce in either CSP header on the *request*.
  requestHeaders.set(headerName, headerValue);
  return { nonce, headerName, headerValue, requestHeaders };
}

export function applyCspHeader(response: NextResponse, ctx: CspContext): NextResponse {
  if (ctx.headerName && ctx.headerValue) response.headers.set(ctx.headerName, ctx.headerValue);
  return response;
}

/**
 * Wrap your middleware logic. `handler` receives the request headers that
 * already carry the nonce and MUST build its NextResponse with them:
 *   NextResponse.next({ request: { headers: requestHeaders } })
 * Redirects work as-is.
 */
export async function withCsp(
  request: NextRequest,
  handler: (requestHeaders: Headers) => NextResponse | Promise<NextResponse>,
): Promise<NextResponse> {
  const ctx = createCspContext(request);
  const response = await handler(ctx.requestHeaders);
  return applyCspHeader(response, ctx);
}
