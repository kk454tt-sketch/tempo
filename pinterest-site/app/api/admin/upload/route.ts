import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { isUuid } from "@/lib/admin/product-schema";
import { MAX_GALLERY, MAX_UPLOAD_BYTES, STORAGE_BUCKET } from "@/lib/admin/storage";
import { logger } from "@/lib/logger";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { detectImageMime, withThumbPaths } from "@/lib/storage/image-magic";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireAdminSession(): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true, userId: user.id };
}

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(RATE_LIMITS.adminUpload, request.headers);
  if (limited) return limited;

  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data." }, { status: 400 });
  }

  const file = form.get("file");
  const productId = String(form.get("productId") ?? "");
  const kind = String(form.get("kind") ?? "main");

  if (!isUuid(productId)) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }
  if (kind !== "main" && kind !== "gallery") {
    return NextResponse.json({ error: "Invalid upload kind." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: "Select an image file to upload." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image must be 4MB or smaller." }, { status: 413 });
  }

  const raw = new Uint8Array(await file.arrayBuffer());
  if (raw.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image must be 4MB or smaller." }, { status: 413 });
  }
  if (!detectImageMime(raw)) {
    return NextResponse.json({ error: "Only valid PNG, JPG or WEBP images are allowed." }, { status: 400 });
  }

  const admin = createAdminClient();

  if (kind === "gallery") {
    const { data: product } = await admin
      .from("products")
      .select("gallery_urls")
      .eq("id", productId)
      .maybeSingle();
    const existingCount = Array.isArray(product?.gallery_urls) ? product.gallery_urls.length : 0;
    if (existingCount >= MAX_GALLERY) {
      return NextResponse.json({ error: `At most ${MAX_GALLERY} gallery images are allowed.` }, { status: 400 });
    }
  }

  let mainBuffer: Buffer;
  let thumbBuffer: Buffer;
  try {
    const inputBuffer = Buffer.from(raw);
    [mainBuffer, thumbBuffer] = await Promise.all([
      sharp(inputBuffer)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer(),
      sharp(inputBuffer)
        .rotate()
        .resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer(),
    ]);
  } catch (error) {
    logger.warn("upload.process_failed", { productId, error });
    return NextResponse.json({ error: "Could not process this image file." }, { status: 400 });
  }

  const id = randomUUID();
  const path = `products/${productId}/${id}.webp`;
  const thumbPath = `products/${productId}/${id}-sm.webp`;

  const bucket = admin.storage.from(STORAGE_BUCKET);
  const mainUpload = await bucket.upload(path, mainBuffer, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });
  if (mainUpload.error) {
    logger.error("upload.storage_failed", { productId, error: mainUpload.error.message });
    return NextResponse.json({ error: "Could not store image. Try again." }, { status: 500 });
  }

  const thumbUpload = await bucket.upload(thumbPath, thumbBuffer, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });
  if (thumbUpload.error) {
    await bucket.remove([path]).catch(() => undefined);
    logger.error("upload.thumb_storage_failed", { productId, error: thumbUpload.error.message });
    return NextResponse.json({ error: "Could not store image thumbnail. Try again." }, { status: 500 });
  }

  const url = bucket.getPublicUrl(path).data.publicUrl;
  const thumbUrl = bucket.getPublicUrl(thumbPath).data.publicUrl;

  return NextResponse.json({ url, thumbUrl, path });
}

export async function DELETE(request: NextRequest) {
  const limited = await enforceRateLimit(RATE_LIMITS.adminUpload, request.headers);
  if (limited) return limited;

  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const path =
    body && typeof body === "object" && "path" in body && typeof (body as { path: unknown }).path === "string"
      ? (body as { path: string }).path.trim()
      : "";

  if (!path.startsWith("products/") || path.includes("..")) {
    return NextResponse.json({ error: "Invalid image path." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.storage.from(STORAGE_BUCKET).remove(withThumbPaths([path]));
  if (error) {
    logger.error("upload.delete_failed", { path, error: error.message });
    return NextResponse.json({ error: "Could not delete image." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
