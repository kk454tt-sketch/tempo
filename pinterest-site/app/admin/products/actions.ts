'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAdminContext } from '@/lib/admin/guard';
import { escapeLike } from '@/lib/admin/filters';
import {
  isUuid,
  parsePrice,
  validateProduct,
  type ActionResult,
  type CategoryOption,
  type FieldErrors,
  type ProductInput,
  type SaveResult,
} from '@/lib/admin/product-schema';
import { STORAGE_BUCKET, storagePathFromUrl, validateImageFile } from '@/lib/admin/storage';
import { ALL_CODES, STORES } from '@/lib/admin/stores';
import { slugify } from '@/lib/slug';
import { withThumbPaths } from '@/lib/storage/image-magic';
import { createAdminClient } from '@/lib/supabase/admin';

const NO_ACCESS = 'You do not have admin access.';
const fail = (message: string) => ({ ok: false as const, message });

function revalidateCatalog(slug?: string | null) {
  revalidateTag('catalog');
  if (slug) {
    revalidateTag(`product:${slug}`);
    revalidatePath(`/products/${slug}`);
  }
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/products/[slug]', 'page');
  revalidatePath('/categories');
  revalidatePath('/admin');
  revalidatePath('/admin/products');
}

/* ---------- storage helpers (service role: the bucket is admin-write only) ---------- */

type FileMeta = { size?: number; mimetype?: string } | null;

async function verifyImages(admin: SupabaseClient, input: ProductInput): Promise<FieldErrors> {
  const refs: { key: string; url: string }[] = [];
  if (input.imageUrl) refs.push({ key: 'imageUrl', url: input.imageUrl });
  for (const url of input.galleryUrls) refs.push({ key: 'galleryUrls', url });
  if (refs.length === 0) return {};

  const folder = `products/${input.id}`;
  const { data, error } = await admin.storage.from(STORAGE_BUCKET).list(folder, { limit: 1000 });
  if (error) return { [refs[0].key]: 'Could not verify the uploaded image. Try again.' };

  const files = new Map<string, FileMeta>(
    (data ?? []).map((f): [string, FileMeta] => [f.name, f.metadata as FileMeta]),
  );
  const errors: FieldErrors = {};
  for (const { key, url } of refs) {
    const path = storagePathFromUrl(url);
    const name = path?.startsWith(`${folder}/`) ? path.slice(folder.length + 1) : '';
    const meta = name && !name.includes('/') ? files.get(name) : undefined;
    if (!meta) {
      errors[key] ??= 'Image not found. Please upload it again.';
      continue;
    }
    const problem = validateImageFile({ type: meta.mimetype ?? '', size: meta.size ?? 0 });
    if (problem) errors[key] ??= problem;
  }
  return errors;
}

async function removeUrls(admin: SupabaseClient, productId: string, urls: string[]) {
  const folder = `products/${productId}/`;
  const paths = urls.map(storagePathFromUrl).filter((p): p is string => !!p && p.startsWith(folder));
  if (paths.length === 0) return;
  try {
    await admin.storage.from(STORAGE_BUCKET).remove(withThumbPaths(paths));
  } catch {
    // best effort: a leftover file is harmless
  }
}

async function removeFolder(admin: SupabaseClient, productId: string) {
  try {
    const folder = `products/${productId}`;
    const { data } = await admin.storage.from(STORAGE_BUCKET).list(folder, { limit: 1000 });
    const paths = (data ?? []).map((f) => `${folder}/${f.name}`);
    if (paths.length) await admin.storage.from(STORAGE_BUCKET).remove(paths);
  } catch {
    // best effort
  }
}

async function uniqueSlug(
  supabase: SupabaseClient,
  table: 'products' | 'categories',
  base: string,
  excludeId?: string,
): Promise<string> {
  let query = supabase.from(table).select('slug').like('slug', `${base}%`).limit(1000);
  if (excludeId) query = query.neq('id', excludeId);
  const { data } = await query;
  const taken = new Set(((data ?? []) as { slug: string }[]).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  return `${base}-${Date.now()}`;
}

/* ---------- list: stock toggle ---------- */

export async function toggleStockAction(productId: string, country: string, inStock: boolean): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return fail(NO_ACCESS);

  const parsed = z
    .object({ productId: z.string().refine(isUuid), country: z.enum(ALL_CODES), inStock: z.boolean() })
    .safeParse({ productId, country, inStock });
  if (!parsed.success) return fail('Invalid request.');

  const { data, error } = await ctx.supabase
    .from('product_links')
    .update({ in_stock: parsed.data.inStock })
    .eq('product_id', parsed.data.productId)
    .eq('country_code', parsed.data.country)
    .select('id');
  if (error) return fail('Could not update stock. Try again.');
  if (!data || data.length === 0) return fail('This product has no link for that country.');

  revalidateCatalog();
  return { ok: true };
}

/* ---------- form: categories ---------- */

export async function createCategoryAction(
  rawName: string,
): Promise<{ ok: true; category: CategoryOption } | { ok: false; message: string }> {
  const ctx = await getAdminContext();
  if (!ctx) return fail(NO_ACCESS);

  const parsed = z
    .string()
    .trim()
    .min(2, 'Category name must be at least 2 characters.')
    .max(60, 'Category name must be 60 characters or fewer.')
    .safeParse(rawName);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid name.');
  const name = parsed.data;
  const { supabase } = ctx;

  const { data: existing } = await supabase.from('categories').select('id, name').ilike('name', escapeLike(name)).limit(1);
  if (existing && existing.length > 0) return { ok: true, category: existing[0] as CategoryOption };

  const { data: last } = await supabase.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1);
  const sortOrder = ((last?.[0]?.sort_order as number | undefined) ?? -1) + 1;
  const base = slugify(name) || 'category';

  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = await uniqueSlug(supabase, 'categories', base);
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug, sort_order: sortOrder })
      .select('id, name')
      .single();
    if (!error && data) {
      revalidatePath('/admin/products');
      return { ok: true, category: data as CategoryOption };
    }
    if (error?.code !== '23505') break; // only retry on a slug race
  }
  return fail('Could not create the category. Try again.');
}

/* ---------- form: save ---------- */

export async function saveProductAction(raw: unknown): Promise<SaveResult> {
  const ctx = await getAdminContext();
  if (!ctx) return fail(NO_ACCESS);

  const { data: input, errors } = validateProduct(raw);
  if (!input) return { ok: false, message: 'Please fix the highlighted fields.', fieldErrors: errors };

  const { supabase } = ctx;
  const admin = createAdminClient();

  const imageErrors = await verifyImages(admin, input);
  if (Object.keys(imageErrors).length > 0) {
    return { ok: false, message: 'Please fix the highlighted fields.', fieldErrors: imageErrors };
  }

  const { data: existing, error: loadError } = await supabase
    .from('products')
    .select('slug, image_url, gallery_urls')
    .eq('id', input.id)
    .maybeSingle();
  if (loadError) return fail('Could not load the product. Try again.');

  const links = ALL_CODES.flatMap((code) => {
    const link = input.links[code];
    const url = link.url.trim();
    if (!url) return []; // empty row = not saved (and removed if it existed)
    return [
      {
        country_code: code,
        url,
        price: code === 'ID' ? null : parsePrice(link.price).value,
        currency: STORES[code].currency,
        in_stock: link.inStock,
      },
    ];
  });

  // A blank slug keeps the existing URL (edit) or comes from the name (new).
  const base = input.slug || (existing?.slug as string | undefined) || slugify(input.name) || 'product';
  let slug = base;
  let saveError: { code?: string; message: string } | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    slug = await uniqueSlug(supabase, 'products', base, input.id);
    const { error } = await supabase.rpc('save_product', {
      p: {
        id: input.id,
        name: input.name,
        slug,
        description: input.description.trim(),
        category_id: input.categoryId,
        image_url: input.imageUrl.trim(),
        gallery_urls: input.galleryUrls,
        is_published: input.isPublished,
        is_featured: input.isFeatured,
        links,
      },
    });
    saveError = error;
    if (!error || error.code !== '23505') break; // retry only when another save took the slug first
  }

  if (saveError) {
    if (saveError.code === '42501') return fail(NO_ACCESS);
    if (saveError.code === '23505') {
      return { ok: false, message: 'That URL slug is already in use.', fieldErrors: { slug: 'That URL slug is already in use.' } };
    }
    if (saveError.code === '23503') {
      return { ok: false, message: 'That category no longer exists.', fieldErrors: { categoryId: 'That category no longer exists.' } };
    }
    return fail('Could not save the product. Try again.');
  }

  // delete Storage files this product no longer uses
  const keep = new Set([input.imageUrl, ...input.galleryUrls]);
  const previous = [existing?.image_url as string | null | undefined, ...((existing?.gallery_urls as string[] | null) ?? [])];
  await removeUrls(admin, input.id, previous.filter((u): u is string => !!u && !keep.has(u)));

  revalidateCatalog(slug);
  if (existing?.slug && existing.slug !== slug) {
    revalidateTag(`product:${existing.slug as string}`);
    revalidatePath(`/products/${existing.slug as string}`);
  }
  return { ok: true, slug, slugChanged: slug !== base };
}

/** Removes files uploaded in the browser but never saved. Never touches files the product still uses. */
export async function discardUploadsAction(productId: string, urls: string[]): Promise<void> {
  const ctx = await getAdminContext();
  if (!ctx || !isUuid(productId)) return;
  const { data } = await ctx.supabase.from('products').select('image_url, gallery_urls').eq('id', productId).maybeSingle();
  const used = new Set<string>([data?.image_url, ...(data?.gallery_urls ?? [])].filter(Boolean));
  await removeUrls(createAdminClient(), productId, urls.slice(0, 20).filter((u) => !used.has(u)));
}

/* ---------- form: delete ---------- */

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return fail(NO_ACCESS);
  if (!isUuid(id)) return fail('Invalid product.');

  // product_links and events go with it (ON DELETE CASCADE)
  const { data, error } = await ctx.supabase.from('products').delete().eq('id', id).select('id');
  if (error) return fail('Could not delete the product. Try again.');
  if (!data || data.length === 0) return fail('This product no longer exists.');

  await removeFolder(createAdminClient(), id);
  revalidateCatalog();
  return { ok: true };
}

/* ---------- form: duplicate ---------- */

export async function duplicateProductAction(
  id: string,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const ctx = await getAdminContext();
  if (!ctx) return fail(NO_ACCESS);
  if (!isUuid(id)) return fail('Invalid product.');

  const { supabase } = ctx;
  const { data: source, error: loadError } = await supabase
    .from('products')
    .select(
      'name, description, category_id, product_links(country_code, url, price, currency, in_stock)',
    )
    .eq('id', id)
    .maybeSingle();

  if (loadError || !source) return fail('Could not load product to duplicate.');

  const rawName = String(source.name ?? 'Product').trim();
  const suffix = ' copy';
  const copyName = `${rawName.slice(0, 120 - suffix.length).trimEnd()}${suffix}`;
  const baseSlug = slugify(copyName) || 'product-copy';
  const newId = randomUUID();

  const links = (
    (source.product_links as
      | { country_code: string; url: string; price: number | string | null; currency: string; in_stock: boolean }[]
      | null) ?? []
  ).map((link) => ({
    country_code: link.country_code,
    url: link.url,
    price: link.price === null || link.price === undefined ? null : Number(link.price),
    currency: link.currency,
    in_stock: link.in_stock,
  }));

  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = await uniqueSlug(supabase, 'products', baseSlug);
    const { error } = await supabase.rpc('save_product', {
      p: {
        id: newId,
        name: copyName,
        slug,
        description: source.description ?? '',
        category_id: source.category_id ?? '',
        image_url: '',
        gallery_urls: [],
        is_published: false,
        is_featured: false,
        links,
      },
    });
    if (!error) {
      revalidatePath('/admin/products');
      return { ok: true, id: newId };
    }
    if (error.code !== '23505') break;
  }

  return fail('Could not duplicate the product. Try again.');
}
