"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { getAdminClient } from "@/lib/admin-client";
import { AFFILIATE_COUNTRIES, isValidTag, normalizeTag } from "@/lib/affiliate";
import { moveId } from "@/lib/category-order";
import { validateNewPassword } from "@/lib/password";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { slugify, uniqueSlug } from "@/lib/slug";

export type ActionResult = { ok: true } | { ok: false; error: string };

const DENIED: ActionResult = { ok: false, error: "You need to be signed in as an admin." };
const fail = (error: string): ActionResult => ({ ok: false, error });

function refresh() {
  revalidateTag("catalog");
  revalidatePath("/admin/settings");
  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/");
}

function cleanName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ");
  return name.length >= 1 && name.length <= 60 ? name : null;
}

export async function addCategory(rawName: string): Promise<ActionResult> {
  const db = await getAdminClient();
  if (!db) return DENIED;
  const name = cleanName(rawName);
  if (!name) return fail("Enter a category name of 1 to 60 characters.");

  const base = slugify(name, "category");
  const [slugs, last] = await Promise.all([
    db.from("categories").select("slug").like("slug", `${base}%`),
    db.from("categories").select("sort_order").order("sort_order", { ascending: false }).limit(1),
  ]);
  if (slugs.error || last.error) return fail("Could not add the category. Try again.");

  const taken = new Set<string>((slugs.data ?? []).map((row: { slug: string }) => row.slug));
  const sortOrder = last.data && last.data.length > 0 ? (last.data[0].sort_order ?? -1) + 1 : 0;
  const { error } = await db
    .from("categories")
    .insert({ name, slug: uniqueSlug(base, taken), sort_order: sortOrder });
  if (error) {
    return fail(error.code === "23505" ? "That category already exists. Try again." : "Could not add the category. Try again.");
  }
  refresh();
  return { ok: true };
}

/** Renames only; the slug stays the same so existing links keep working. */
export async function renameCategory(id: string, rawName: string): Promise<ActionResult> {
  const db = await getAdminClient();
  if (!db) return DENIED;
  const name = cleanName(rawName);
  if (!name) return fail("Enter a category name of 1 to 60 characters.");

  const { data, error } = await db.from("categories").update({ name }).eq("id", id).select("id");
  if (error) return fail("Could not rename the category. Try again.");
  if (!data || data.length === 0) return fail("That category no longer exists.");
  refresh();
  return { ok: true };
}

export async function moveCategory(id: string, direction: "up" | "down"): Promise<ActionResult> {
  const db = await getAdminClient();
  if (!db) return DENIED;

  // Same ordering as the settings page, so what you see is what moves.
  const { data, error } = await db
    .from("categories")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (error || !data) return fail("Could not move the category. Try again.");

  const rows = data as { id: string; sort_order: number | null }[];
  const next = moveId(
    rows.map((r) => r.id),
    id,
    direction,
  );
  if (!next) return fail("That category cannot move further.");

  const { error: reorderError } = await db.rpc("reorder_categories", { p_ids: next });
  if (reorderError) return fail("Could not move the category. Try again.");
  refresh();
  return { ok: true };
}

/** Products in the category become uncategorized, then the category is deleted. */
export async function deleteCategory(id: string): Promise<ActionResult> {
  const db = await getAdminClient();
  if (!db) return DENIED;

  const detach = await db.from("products").update({ category_id: null }).eq("category_id", id);
  if (detach.error) return fail("Could not delete the category. Try again.");

  const { data, error } = await db.from("categories").delete().eq("id", id).select("id");
  if (error) return fail("Could not delete the category. Try again.");
  if (!data || data.length === 0) return fail("That category no longer exists.");
  refresh();
  return { ok: true };
}

/** A filled field saves the tag; an empty field removes it. Indonesia has no field: it uses the US tag. */
export async function saveAffiliateTags(tags: Record<string, string>): Promise<ActionResult> {
  const db = await getAdminClient();
  if (!db) return DENIED;

  const rows: { country_code: string; affiliate_tag: string }[] = [];
  const cleared: string[] = [];
  for (const code of AFFILIATE_COUNTRIES) {
    const tag = normalizeTag(tags[code] ?? "");
    if (tag === "") cleared.push(code);
    else if (!isValidTag(tag)) return fail(`The ${code} tag can only use letters, numbers, hyphens and underscores (up to 64).`);
    else rows.push({ country_code: code, affiliate_tag: tag });
  }

  if (rows.length > 0) {
    const { error } = await db.from("store_settings").upsert(rows, { onConflict: "country_code" });
    if (error) return fail("Could not save the tags. Try again.");
  }
  if (cleared.length > 0) {
    const { error } = await db.from("store_settings").delete().in("country_code", cleared);
    if (error) return fail("Could not save the tags. Try again.");
  }
  revalidateTag("catalog");
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  return { ok: true };
}

export async function changePassword(password: string, confirm: string): Promise<ActionResult> {
  const rl = await checkRateLimit(RATE_LIMITS.passwordChange, await headers());
  if (!rl.success) return fail(`Too many attempts. Try again in ${rl.retryAfterSeconds} seconds.`);

  const db = await getAdminClient();
  if (!db) return DENIED;
  const problem = validateNewPassword(password, confirm);
  if (problem) return fail(problem);

  const { error } = await db.auth.updateUser({ password });
  if (error) return fail(error.message || "Could not change the password. Try again.");
  return { ok: true };
}
