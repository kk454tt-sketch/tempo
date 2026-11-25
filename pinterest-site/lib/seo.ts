import type { Metadata } from "next";

/** NEXT_PUBLIC_SITE_URL without a trailing slash (adds https:// if the scheme is missing). */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return (/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  return siteUrl();
}

/** Social crawlers need full absolute URLs. */
export function absoluteUrl(pathOrUrl = "/"): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl()}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export function summarize(text: string | null | undefined, max = 160): string | null {
  const clean = text?.replace(/\s+/g, " ").trim();
  if (!clean) return null;
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** Title, description, canonical, Open Graph and Twitter tags for one page. `title` is the full title. */
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  return {
    metadataBase: new URL(siteUrl()),
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, siteName: "AffHub", title, description },
    twitter: { card: "summary", title, description },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export type ProductOffer = {
  price: number | null;
  currency: string | null;
  inStock: boolean;
};

type SeoProduct = {
  name: string;
  slug: string;
  description: string | null;
  /** Main image first. */
  images: string[];
};

export function buildProductMetadata(product: SeoProduct): Metadata {
  const description =
    summarize(product.description) ?? `Find ${product.name} on Amazon, linked to your country's store.`;
  const url = absoluteUrl(`/products/${product.slug}`);
  const mainImage = product.images[0] ? absoluteUrl(product.images[0]) : null;

  return {
    title: { absolute: `${product.name} | AffHub` },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description,
      url,
      siteName: "AffHub",
      images: mainImage ? [{ url: mainImage, alt: product.name }] : undefined,
    },
    twitter: {
      card: mainImage ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: mainImage ? [mainImage] : undefined,
    },
  };
}

export function buildProductJsonLd(
  product: SeoProduct & { categoryName: string | null; offer: ProductOffer | null },
): Record<string, unknown> {
  const url = absoluteUrl(`/products/${product.slug}`);
  const { offer } = product;
  const description = summarize(product.description, 500);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url,
    ...(description ? { description } : {}),
    ...(product.images.length > 0 ? { image: product.images.map(absoluteUrl) } : {}),
    ...(product.categoryName ? { category: product.categoryName } : {}),
    ...(offer && offer.price !== null && offer.currency
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: offer.price,
            priceCurrency: offer.currency,
            availability: offer.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
        }
      : {}),
  };
}
