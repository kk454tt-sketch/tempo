import "server-only";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDetectedCountryCode } from "@/lib/country";
import {
  ATTRIBUTION_COOKIE,
  SESSION_COOKIE,
  detectDevice,
  isBot,
  isPrefetch,
  readAttribution,
  resolveSource,
} from "@/lib/tracking";
import type { DeviceType, EventInsert, EventType } from "@/lib/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VIEW_DEDUP_WINDOW_MS = 30 * 60 * 1000;

export type RequestContext = {
  isBot: boolean;
  isPrefetch: boolean;
  device: DeviceType;
  source: string;
  campaign: string | null;
  content: string | null;
  term: string | null;
  sessionId: string | null;
};

/**
 * Reads what tracking needs from the current request. Call it BEFORE `after()`:
 * request APIs are not available inside the callback. No IP address is read or stored.
 */
export async function getRequestContext(): Promise<RequestContext> {
  const [headerList, cookieStore] = await Promise.all([headers(), cookies()]);

  const userAgent = headerList.get("user-agent") ?? "";
  const attribution = readAttribution(cookieStore.get(ATTRIBUTION_COOKIE)?.value);
  const rawSid = cookieStore.get(SESSION_COOKIE)?.value;
  const sessionId = rawSid && UUID_RE.test(rawSid) ? rawSid : null;

  return {
    isBot: isBot(userAgent),
    isPrefetch: isPrefetch(headerList),
    device: detectDevice(userAgent),
    source: resolveSource(attribution),
    campaign: attribution?.campaign ?? null,
    content: attribution?.content ?? null,
    term: attribution?.term ?? null,
    sessionId,
  };
}

/** Insert one event with the service role. Never throws: tracking must not break a page or a redirect. */
export async function insertEvent(event: EventInsert): Promise<void> {
  try {
    const admin = createAdminClient();
    if (event.type === "product_view" && event.session_id) {
      const since = new Date(Date.now() - VIEW_DEDUP_WINDOW_MS).toISOString();
      const { data: existing } = await admin
        .from("events")
        .select("id")
        .eq("session_id", event.session_id)
        .eq("product_id", event.product_id)
        .eq("type", "product_view")
        .gte("created_at", since)
        .limit(1);
      if (existing && existing.length > 0) return;
    }

    const { error } = await admin.from("events").insert(event);
    if (error) console.error("[affhub] event insert failed:", error.message);
  } catch (err) {
    console.error("[affhub] event insert failed:", err instanceof Error ? err.message : err);
  }
}

export type EventInput = {
  type: EventType;
  productId: string;
  visitorCountry: string;
  storeCountry: string;
  context: Pick<RequestContext, "source" | "campaign" | "content" | "term" | "device" | "sessionId">;
};

/** Inserts an analytics event with the service role. Never throws. */
export async function recordEvent(input: EventInput): Promise<void> {
  await insertEvent({
    type: input.type,
    product_id: input.productId,
    visitor_country: input.visitorCountry,
    store_country: input.storeCountry,
    source: input.context.source,
    campaign: input.context.campaign,
    content: input.context.content ?? null,
    term: input.context.term ?? null,
    device: input.context.device,
    session_id: input.context.sessionId ?? null,
  });
}

interface TrackInput {
  type: EventType;
  productId: string;
  /** Country of the product link that was shown or opened. */
  storeCountry: string | null;
}

/**
 * Record a product_view or click from the current request, after the response has been sent.
 * Call it from a server component or route handler. Bots are skipped and no IP address is stored.
 */
export async function trackEvent({ type, productId, storeCountry }: TrackInput): Promise<void> {
  try {
    const [ctx, detected] = await Promise.all([getRequestContext(), getDetectedCountryCode()]);
    if (ctx.isBot || (type === "product_view" && ctx.isPrefetch)) return;

    const event: EventInsert = {
      type,
      product_id: productId,
      visitor_country: detected,
      store_country: storeCountry,
      source: ctx.source,
      campaign: ctx.campaign,
      content: ctx.content,
      term: ctx.term,
      device: ctx.device,
      session_id: ctx.sessionId,
    };

    try {
      after(() => insertEvent(event));
    } catch {
      void insertEvent(event);
    }
  } catch (err) {
    console.error("[affhub] tracking failed:", err instanceof Error ? err.message : err);
  }
}
