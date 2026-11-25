/**
 * npm run setup  (safe to re-run)
 *  1. Applies every file in supabase/migrations through SUPABASE_DB_URL.
 *  2. Creates / updates the "product-images" storage bucket.
 *  3. Creates the admin auth user from ADMIN_EMAIL / ADMIN_PASSWORD and registers it in public.admins.
 *  4. Prints a clear success or error message.
 *
 * Re-running keeps an existing admin's password; pass --reset-password to set it from ADMIN_PASSWORD again.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

config({ path: [".env.local", ".env"] });

const BUCKET = "product-images";
const BUCKET_OPTIONS = {
  public: true,
  fileSizeLimit: 5 * 1024 * 1024,
  allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
};
const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_DB_URL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
] as const;

const resetPassword = process.argv.includes("--reset-password");

function ok(message: string) {
  console.log(`  ✔ ${message}`);
}

function describe(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { message?: string; detail?: string; hint?: string; code?: string };
    return [e.message, e.detail, e.hint].filter(Boolean).join(" | ") || String(err);
  }
  return String(err);
}

async function main() {
  console.log("AffHub setup\n");

  const missing = REQUIRED_ENV.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing in .env.local: ${missing.join(", ")}. Copy .env.example to .env.local and fill it in.`);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  const dbUrl = process.env.SUPABASE_DB_URL as string;
  const adminEmail = (process.env.ADMIN_EMAIL as string).trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD as string;
  if (adminPassword.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters.");

  const isLocalDb = /@(localhost|127\.0\.0\.1)[:/]/.test(dbUrl);
  const sql = postgres(dbUrl, {
    max: 1,
    ssl: isLocalDb ? false : "require",
    connect_timeout: 20,
    onnotice: () => {},
  });

  try {
    // 1) Migrations
    console.log("1/3 Database migrations");
    const dir = join(process.cwd(), "supabase", "migrations");
    const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
    if (files.length === 0) throw new Error(`No .sql files found in ${dir}`);
    for (const file of files) {
      const text = readFileSync(join(dir, file), "utf8");
      try {
        await sql.begin(async (tx) => {
          await tx.unsafe(text);
        });
      } catch (err) {
        throw new Error(`Migration ${file} failed: ${describe(err)}`);
      }
      ok(`applied ${file}`);
    }
    const policies = await sql<{ policyname: string }[]>`
      select policyname from pg_policies
      where schemaname = 'storage' and tablename = 'objects' and policyname like 'product-images%'
    `;
    if (policies.length < 4) {
      console.warn(
        "  ! Storage policies for product-images were not created (the database role lacked permission).\n" +
          "    Admin image uploads from the browser will fail until they exist. Run the last block of\n" +
          "    supabase/migrations/0001_init.sql (the one that starts with `do $storage$`) in the Supabase SQL Editor.",
      );
    }

    // 2) Storage bucket
    console.log("2/3 Storage bucket");
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: buckets, error: listError } = await admin.storage.listBuckets();
    if (listError) throw new Error(`Could not list storage buckets: ${listError.message}`);
    if (buckets.some((b) => b.name === BUCKET)) {
      const { error } = await admin.storage.updateBucket(BUCKET, BUCKET_OPTIONS);
      if (error) throw new Error(`Could not update bucket "${BUCKET}": ${error.message}`);
      ok(`bucket "${BUCKET}" already exists (settings verified)`);
    } else {
      const { error } = await admin.storage.createBucket(BUCKET, BUCKET_OPTIONS);
      if (error) throw new Error(`Could not create bucket "${BUCKET}": ${error.message}`);
      ok(`created bucket "${BUCKET}" (public read, 5 MB, png/jpg/webp)`);
    }

    // 3) Admin user
    console.log("3/3 Admin user");
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });
    let userId = created?.user?.id;
    if (userId) {
      ok(`created admin user ${adminEmail}`);
    } else {
      const rows = await sql<{ id: string }[]>`
        select id from auth.users where lower(email) = ${adminEmail} limit 1
      `;
      const existing = rows[0];
      if (!existing) throw new Error(`Could not create the admin user: ${createError?.message ?? "unknown error"}`);
      userId = existing.id;
      const { error } = await admin.auth.admin.updateUserById(userId, {
        email_confirm: true,
        ...(resetPassword ? { password: adminPassword } : {}),
      });
      if (error) throw new Error(`Could not update the existing admin user: ${error.message}`);
      ok(
        resetPassword
          ? `admin user ${adminEmail} already existed (password reset from ADMIN_PASSWORD)`
          : `admin user ${adminEmail} already existed (password unchanged, use --reset-password to reset it)`,
      );
    }
    await sql`insert into public.admins (user_id) values (${userId}) on conflict (user_id) do nothing`;
    ok("admin registered in public.admins");

    console.log(`\n✔ Setup complete. Start the site with \`npm run dev\` and sign in at /admin/login as ${adminEmail}.`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(`\n✖ Setup failed: ${describe(err)}`);
  process.exit(1);
});
