import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";
import rawTokens from "./design/tailwind-tokens.json";

/**
 * Design tokens (colors, fontSize, borderRadius, spacing, ...) come from the Stitch export.
 * `npm run design:sync` copies the export to design/stitch and writes design/tailwind-tokens.json
 * from the Tailwind config embedded in its code.html files. Do not hand-edit that JSON.
 */
interface DesignTokens {
  source: string | null;
  darkMode: string | null;
  plugins: string[];
  theme: Record<string, unknown>;
  extend: Record<string, unknown> & { fontFamily?: Record<string, unknown> };
}

const tokens = rawTokens as unknown as DesignTokens;

if (tokens.source === null) {
  console.warn(
    "[affhub] design/tailwind-tokens.json is empty: run `npm run design:sync` to load the Stitch design tokens.",
  );
}

const fontStack = ["var(--font-plus-jakarta-sans)", "ui-sans-serif", "system-ui", "sans-serif"];

const plugins: NonNullable<Config["plugins"]> = [];
if (tokens.plugins.includes("forms")) plugins.push(forms);
if (tokens.plugins.includes("container-queries")) plugins.push(containerQueries);

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  ...(tokens.darkMode ? { darkMode: tokens.darkMode as Config["darkMode"] } : {}),
  theme: {
    ...tokens.theme,
    extend: {
      ...tokens.extend,
      fontFamily: { sans: fontStack, ...(tokens.extend.fontFamily ?? {}) },
    },
  } as unknown as Config["theme"],
  plugins,
};

export default config;
