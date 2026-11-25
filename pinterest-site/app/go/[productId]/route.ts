import { after, NextResponse, type NextRequest } from "next/server";
import { affiliateTagFor, getAffiliateTags } from "@/lib/affiliate";
import { getVisitorCountry } from "@/lib/country";
import { getRequestContext, recordEvent } from "@/lib/events";
import { logger } from "@/lib/logger";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { parseStoreParam, pickLink } from "@/lib/stores";
import { createClient } from "@/lib/supabase/server";
import { appendAffiliateTag } from "@/lib/tracking";
import { isAllowedHost } from "@/lib/url-allowlist";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ productId: string }> };

type ProductWithRawLinks = {
  id: string;
  slug: string;
  product_links: { country_code: string; url: string; in_stock: boolean }[];
};

function redirectTo(url: string | URL): NextResponse {
  const response = NextResponse.redirect(url, 302);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const limited = await enforceRateLimit(RATE_LIMITS.go, request.headers);
  if (limited) return limited;

  const { productId } = await params;

  if (!UUID_PATTERN.test(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, product_links(country_code, url, in_stock)")
    .eq("id", productId)
    .eq("is_published", true)
    .maybeSingle();

  const product = data as unknown as ProductWithRawLinks | null;
  if (error || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const visitorCountry = await getVisitorCountry();
  const storeOverride = parseStoreParam(request.nextUrl.searchParams.get("store"));
  const link = pickLink(product.product_links, visitorCountry, storeOverride);

  // Missing or out-of-stock link redirects back to the product page without logging a click.
  if (!link || !link.in_stock) {
    return redirectTo(new URL(`/products/${product.slug}`, request.url));
  }

  if (!isAllowedHost(link.url)) {
    logger.error("go.disallowed_host", { productId: product.id, country: link.country_code });
    return NextResponse.json({ error: "Destination URL is not allowed" }, { status: 400 });
  }

  const tags = await getAffiliateTags();
  const target = appendAffiliateTag(link.url, affiliateTagFor(tags, link.country_code));

  // Read request data now; it is not available inside after().
  const context = await getRequestContext();
  if (!context.isBot) {
    after(() =>
      recordEvent({
        type: "click",
        productId: product.id,
        visitorCountry,
        storeCountry: link.country_code,
        context,
      }),
    );
  }

  return redirectTo(target);
}
