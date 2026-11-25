import type { Metadata } from "next";

/**
 * Renders <meta name="p:domain_verify" content="..."> when
 * NEXT_PUBLIC_PINTEREST_VERIFY is set, and nothing otherwise.
 *
 * app/page.tsx (home page only):
 *   export const metadata: Metadata = { ...yourMetadata, ...pinterestVerifyMetadata() };
 * or inside generateMetadata():
 *   return { ...yourMetadata, other: { ...yourMetadata.other, ...pinterestVerifyMetadata().other } };
 */
export function pinterestVerifyMetadata(): Pick<Metadata, "other"> {
  const code = process.env.NEXT_PUBLIC_PINTEREST_VERIFY?.trim();
  return code ? { other: { "p:domain_verify": code } } : {};
}
