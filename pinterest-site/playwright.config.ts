import { defineConfig, devices } from "@playwright/test";

/**
 * npm run test:e2e
 * Runs against an app that is already running (npm run dev, or npm run build && npm run start).
 * Set E2E_START_SERVER=1 to have Playwright run `npm run start` for you (build first).
 *
 * Required env: E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD (a real admin of the project you point at).
 * Optional:     E2E_BASE_URL (default http://localhost:3000), E2E_COUNTRY (default US),
 *               E2E_EXPECTED_HOST (default amazon.com), SUPABASE_SERVICE_ROLE_KEY (cleanup fallback).
 *
 * Locally x-vercel-ip-country does not exist, so the tests send it as a request header.
 * If your country detection reads a different dev override, set it in smoke.e2e.ts.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.e2e\.ts$/, // not *.spec.ts, so vitest never picks these up
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    extraHTTPHeaders: { "x-vercel-ip-country": process.env.E2E_COUNTRY ?? "US" },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_START_SERVER
    ? { command: "npm run start", url: baseURL, reuseExistingServer: true, timeout: 120_000 }
    : undefined,
});
