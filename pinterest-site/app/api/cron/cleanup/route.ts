import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
// Prompt 0F. Adjust this path/shape if yours differs; see normalizeOrphans().
import { findOrphans } from "@/lib/storage/orphans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH = 5000;
const TIME_BUDGET_MS = 45_000;
const REMOVE_CHUNK = 100;
/** Safety valve: if findOrphans() reports more than this, assume a bug and delete nothing. */
const ORPHAN_DELETE_MAX = Number.parseInt(process.env.ORPHAN_DELETE_MAX ?? "", 10) || 500;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed
  const got = Buffer.from(request.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

function retentionDays(): number {
  const n = Number.parseInt(process.env.EVENT_RETENTION_DAYS ?? "", 10);
  if (Number.isFinite(n) && n >= 1) return n;
  if (process.env.EVENT_RETENTION_DAYS) logger.warn("cron.cleanup.bad_retention_env", { value: process.env.EVENT_RETENTION_DAYS });
  return 400;
}

/** Accepts string[] or { bucket?, paths } or { orphans: string[] } from findOrphans(). */
function normalizeOrphans(result: unknown): { bucket: string; paths: string[] } {
  const fallbackBucket = process.env.STORAGE_BUCKET ?? "product-images";
  if (Array.isArray(result)) return { bucket: fallbackBucket, paths: result.filter((p): p is string => typeof p === "string") };
  if (result && typeof result === "object") {
    const r = result as { bucket?: unknown; paths?: unknown; orphans?: unknown };
    const list = Array.isArray(r.paths) ? r.paths : Array.isArray(r.orphans) ? r.orphans : [];
    return {
      bucket: typeof r.bucket === "string" ? r.bucket : fallbackBucket,
      paths: list.filter((p): p is string => typeof p === "string"),
    };
  }
  return { bucket: fallbackBucket, paths: [] };
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const started = Date.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    logger.error("cron.cleanup.misconfigured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const days = retentionDays();
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();

  // 1) Old events, in batches.
  let eventsDeleted = 0;
  let partial = false;
  try {
    for (;;) {
      const { data, error } = await supabase.rpc("cleanup_old_events", { p_cutoff: cutoff, p_batch: BATCH });
      if (error) throw new Error(error.message);
      const n = typeof data === "number" ? data : 0;
      eventsDeleted += n;
      if (n < BATCH) break;
      if (Date.now() - started > TIME_BUDGET_MS) {
        partial = true; // the next daily run continues
        break;
      }
    }
  } catch (error) {
    logger.error("cron.cleanup.events_failed", { error });
    return NextResponse.json({ ok: false, step: "events", eventsDeleted }, { status: 500 });
  }

  // 2) Orphan images.
  let orphansFound = 0;
  let orphansDeleted = 0;
  let orphansSkipped = false;
  try {
    const { bucket, paths } = normalizeOrphans(await findOrphans());
    orphansFound = paths.length;
    if (paths.length > ORPHAN_DELETE_MAX) {
      orphansSkipped = true;
      logger.warn("cron.cleanup.orphans_skipped", { found: paths.length, max: ORPHAN_DELETE_MAX });
    } else {
      for (let i = 0; i < paths.length; i += REMOVE_CHUNK) {
        const chunk = paths.slice(i, i + REMOVE_CHUNK);
        const { data, error } = await supabase.storage.from(bucket).remove(chunk);
        if (error) throw new Error(error.message);
        orphansDeleted += data?.length ?? 0;
      }
    }
  } catch (error) {
    logger.error("cron.cleanup.orphans_failed", { error });
    return NextResponse.json({ ok: false, step: "orphans", eventsDeleted }, { status: 500 });
  }

  const summary = {
    ok: true,
    retentionDays: days,
    cutoff,
    eventsDeleted,
    partial,
    orphansFound,
    orphansDeleted,
    orphansSkipped,
    durationMs: Date.now() - started,
  };
  logger.info("cron.cleanup.done", summary);
  return NextResponse.json(summary);
}
