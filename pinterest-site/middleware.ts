import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  COUNTRY_COOKIE,
  DETECTED_COOKIE,
  detectCountryCode,
  isSupportedCountry,
  normalizeCountry,
} from "@/lib/countries";
import { EFFECTIVE_COUNTRY_HEADER } from "@/lib/country";
import { devCountry } from "@/lib/dev-country";
import { withCsp } from "@/lib/security/csp";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  isBot,
  isPrefetch,
  parseAttribution,
  readAttribution,
  serializeAttribution,
} from "@/lib/tracking";

const DETECTED_MAX_AGE = 60 * 60 * 24;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PendingCookie = { name: string; value: string; maxAge: number; httpOnly: boolean };
type SessionCookie = { name: string; value: string; options: CookieOptions };

function isProtectedAdminPath(pathname: string): boolean {
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function hardenAdmin(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

/** Fail closed: any error while checking the session or the admin role counts as "not an admin". */
async function isAdminSession(
  request: NextRequest,
  onCookies: (cookies: SessionCookie[]) => void,
): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          onCookies(cookiesToSet.map(({ name, value, options }) => ({ name, value, options })));
        },
      },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return false;
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
    return !adminError && isAdmin === true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  return withCsp(request, async (requestHeaders) => {
    const { pathname } = request.nextUrl;
    const pending: PendingCookie[] = [];
    const sessionCookies: SessionCookie[] = [];

    // 1. Country detection (dev ?country=XX overrides in non-production) + forward effective country.
    const detected = devCountry(request.nextUrl) ?? detectCountryCode(request.headers);
    if (detected && request.cookies.get(DETECTED_COOKIE)?.value !== detected) {
      request.cookies.set(DETECTED_COOKIE, detected);
      pending.push({ name: DETECTED_COOKIE, value: detected, maxAge: DETECTED_MAX_AGE, httpOnly: false });
    }
    const manual = request.cookies.get(COUNTRY_COOKIE)?.value;
    const effectiveCountry = isSupportedCountry(manual)
      ? manual
      : normalizeCountry(detected ?? request.cookies.get(DETECTED_COOKIE)?.value);
    requestHeaders.set(EFFECTIVE_COUNTRY_HEADER, effectiveCountry);

    // 2. Campaign attribution (utm_* and referrer host) in a first-party cookie for 30 days.
    const existing = readAttribution(request.cookies.get(ATTRIBUTION_COOKIE)?.value);
    const fresh = parseAttribution(request.nextUrl, request.headers.get("referer"), existing);
    if (fresh) {
      const value = serializeAttribution(fresh);
      request.cookies.set(ATTRIBUTION_COOKIE, value);
      pending.push({ name: ATTRIBUTION_COOKIE, value, maxAge: ATTRIBUTION_MAX_AGE, httpOnly: true });
    }

    // 3. Sliding 30-minute session ID for non-bot, non-prefetch visitors.
    const ua = request.headers.get("user-agent");
    if (!isBot(ua) && !isPrefetch(request.headers)) {
      const currentSid = request.cookies.get(SESSION_COOKIE)?.value;
      const sid = currentSid && UUID_RE.test(currentSid) ? currentSid : crypto.randomUUID();
      request.cookies.set(SESSION_COOKIE, sid);
      pending.push({ name: SESSION_COOKIE, value: sid, maxAge: SESSION_MAX_AGE, httpOnly: true });
    }

    const secure = request.nextUrl.protocol === "https:";
    const finish = (response: NextResponse): NextResponse => {
      for (const c of pending) {
        response.cookies.set(c.name, c.value, {
          path: "/",
          maxAge: c.maxAge,
          httpOnly: c.httpOnly,
          sameSite: "lax",
          secure,
        });
      }
      for (const c of sessionCookies) {
        response.cookies.set(c.name, c.value, c.options);
      }
      return response;
    };

    // 4. /admin/* is only for signed-in admins (fail closed).
    if (isProtectedAdminPath(pathname)) {
      const isAdmin = await isAdminSession(request, (list) => sessionCookies.push(...list));
      if (!isAdmin) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/admin/login";
        loginUrl.search = "";
        loginUrl.searchParams.set("next", pathname);
        return hardenAdmin(finish(NextResponse.redirect(loginUrl)));
      }
      return hardenAdmin(finish(NextResponse.next({ request: { headers: requestHeaders } })));
    }

    if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
      return hardenAdmin(finish(NextResponse.next({ request: { headers: requestHeaders } })));
    }

    return finish(NextResponse.next({ request: { headers: requestHeaders } }));
  });
}

export const config = {
  matcher: [
    "/((?!api/health|api/cron(?:/|$)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff|woff2)$).*)",
  ],
};
