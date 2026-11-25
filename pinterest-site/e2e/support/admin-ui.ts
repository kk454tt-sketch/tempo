import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

export const LOGIN_PATH = "/admin/login";
export const NEW_PRODUCT_PATH = "/admin/products/new";
export const PRODUCTS_PATH = "/admin/products";

export async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto(LOGIN_PATH);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => !url.pathname.includes("login"), { timeout: 15_000 });
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export type CreatedProduct = { title: string; slug: string };

/** Creates a published product with a single US link through ProductForm. */
export async function createProduct(page: Page, input: { title: string; usUrl: string }): Promise<CreatedProduct> {
  await page.goto(NEW_PRODUCT_PATH);
  await page.getByLabel("Product name").fill(input.title);

  const slugValue = slugify(input.title);
  await page.getByLabel("United States Amazon link").fill(input.usUrl);

  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL((url) => url.pathname === PRODUCTS_PATH, { timeout: 15_000 });
  await expect(page.getByText(input.title).first()).toBeVisible({ timeout: 15_000 });
  return { title: input.title, slug: slugValue };
}

/** Deletes the product through the admin UI; falls back to the service role if the UI path fails. */
export async function deleteProduct(page: Page, product: CreatedProduct): Promise<void> {
  try {
    await page.goto(PRODUCTS_PATH);
    await page.getByText(product.title).first().click();
    await page.getByRole("button", { name: /delete/i }).first().click();
    const confirm = page.getByRole("button", { name: /confirm|yes|delete/i }).last();
    if (await confirm.isVisible().catch(() => false)) await confirm.click();
    await expect(page.getByText(product.title)).toHaveCount(0, { timeout: 10_000 });
    return;
  } catch (uiError) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.warn(`Could not delete test product "${product.title}" via the UI and no service key is set: delete it by hand.`, uiError);
      return;
    }
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.from("products").delete().eq("name", product.title);
    if (error) console.warn(`Fallback delete failed for "${product.title}": ${error.message}. Delete it by hand.`);
  }
}
