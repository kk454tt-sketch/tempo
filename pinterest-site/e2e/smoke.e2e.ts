import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { COOKIES } from "../lib/privacy/inventory";
import { createProduct, deleteProduct, LOGIN_PATH, signIn, type CreatedProduct } from "./support/admin-ui";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const COUNTRY = process.env.E2E_COUNTRY ?? "US";
const EXPECTED_HOST = process.env.E2E_EXPECTED_HOST ?? "amazon.com";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const countryHeaders = { "x-vercel-ip-country": COUNTRY };

test.describe("signed out", () => {
  test("admin login rejects a bad password", async ({ page }) => {
    await page.goto(LOGIN_PATH);
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL ?? "nobody@affhub.invalid");
    await page.getByLabel(/password/i).fill(`wrong-${Date.now()}`);
    await page.getByRole("button", { name: /sign in|log in|login|continue/i }).click();
    await expect(page.getByText(/invalid|incorrect|wrong|failed|error|try again/i).first()).toBeVisible();
    expect(new URL(page.url()).pathname).toContain("login");
  });

  test("/admin redirects when signed out", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/login|sign-?in/i);
  });
});

test.describe.serial("a product created through the admin", () => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD");

  let adminPage: Page;
  let anon: BrowserContext;
  let product: CreatedProduct | undefined;

  test.beforeAll(async ({ browser }) => {
    adminPage = await (await browser.newContext({ baseURL: BASE_URL, extraHTTPHeaders: countryHeaders })).newPage();
    anon = await browser.newContext({ baseURL: BASE_URL, extraHTTPHeaders: countryHeaders }); // fresh: no admin cookies
    await signIn(adminPage, ADMIN_EMAIL!, ADMIN_PASSWORD!);
    product = await createProduct(adminPage, {
      title: `E2E smoke ${Date.now()}`,
      usUrl: `https://www.${EXPECTED_HOST}/dp/B0E2ESMOKE`,
    });
  });

  test.afterAll(async () => {
    if (product) await deleteProduct(adminPage, product);
    await anon?.close();
    await adminPage?.context().close();
  });

  test("home loads, shows the product and sends security headers", async () => {
    const page = await anon.newPage();
    const res = await page.goto("/");
    expect(res?.status()).toBeLessThan(400);
    const h = res!.headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toMatch(/camera=\(\).*microphone=\(\).*geolocation=\(\)/);
    if (process.env.E2E_EXPECT_CSP !== "0") {
      expect(h["content-security-policy"] ?? h["content-security-policy-report-only"]).toContain("frame-ancestors 'none'");
    }
    await expect(page.getByText(product!.title).first()).toBeVisible();
  });

  test("product page loads", async () => {
    const page = await anon.newPage();
    await page.goto("/");
    await page.getByText(product!.title).first().click();
    await expect(page.getByRole("heading", { name: product!.title }).first()).toBeVisible();
  });

  test("/go redirects to the right host", async () => {
    const page = await anon.newPage();
    await page.goto("/");
    await page.getByText(product!.title).first().click();
    const href = await page.locator('a[href*="/go/"], a[href*="/go?"]').first().getAttribute("href");
    expect(href, "no /go link found on the product page").toBeTruthy();

    const res = await anon.request.get(new URL(href!, BASE_URL).toString(), { maxRedirects: 0 });
    expect([301, 302, 303, 307, 308]).toContain(res.status());
    const host = new URL(res.headers()["location"]).hostname;
    expect(host === EXPECTED_HOST || host.endsWith(`.${EXPECTED_HOST}`)).toBe(true);
  });

  test("anonymous visitors only get cookies listed on the privacy page", async () => {
    const names = (await anon.cookies()).map((c) => c.name);
    const allowed = (n: string) => COOKIES.some((c) => (c.prefix ? n.startsWith(c.name) : n === c.name));
    const unexpected = names.filter((n) => !allowed(n));
    expect(unexpected, `undocumented cookies: ${unexpected.join(", ")}`).toEqual([]);
  });
});
