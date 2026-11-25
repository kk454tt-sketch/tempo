import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { after } from 'next/server';
import PageContainer from '@/components/layout/PageContainer';
// Point this import at wherever Prompt 1B put the "Shop by country" pills.
import ShopByCountry from '@/components/layout/ShopByCountry';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductStructuredData from '@/components/product/ProductStructuredData';
import TrendingRow from '@/components/product/TrendingRow';
import { affiliateTagFor, getAffiliateTags } from '@/lib/affiliate';
import { getVisitorCountry } from '@/lib/country';
import { getRequestContext, recordEvent } from '@/lib/events';
import type { SearchParamsInput } from '@/lib/product-filters';
import {
  getProductBySlug,
  getProductImages,
  getRelatedProducts,
  type ProductDetail,
} from '@/lib/product-detail';
import { absoluteUrl, buildProductMetadata, type ProductOffer } from '@/lib/seo';
import { STORE_CODES, buildStoreView, findLink, parseStoreParam, selectStore, type StoreCode, type StoreView } from '@/lib/stores';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParamsInput>;
};

/** The store shown for this request: ?store=XX if valid, else the visitor's country with fallbacks. */
async function resolveSelection(product: ProductDetail, searchParams: SearchParamsInput) {
  const visitorCountry = await getVisitorCountry();
  const selection = selectStore(product.product_links, visitorCountry, parseStoreParam(searchParams.store));
  return { visitorCountry, selection };
}

export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: { absolute: 'Product not found | AffHub' }, robots: { index: false, follow: false } };
  }

  return buildProductMetadata({
    name: product.name,
    slug: product.slug,
    description: product.description,
    images: getProductImages(product),
  });
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const { visitorCountry, selection } = await resolveSelection(product, await searchParams);
  const [tags, related, requestContext] = await Promise.all([
    getAffiliateTags(),
    getRelatedProducts(product),
    getRequestContext(),
  ]);

  // One product_view per page load, written after the response so it can never
  // block rendering. Bots and prefetches are skipped.
  if (!requestContext.isBot && !requestContext.isPrefetch) {
    after(() =>
      recordEvent({
        type: 'product_view',
        productId: product.id,
        visitorCountry,
        storeCountry: selection.link?.country_code ?? 'US',
        context: requestContext,
      }),
    );
  }

  const hasAffiliate = (countryCode: string | undefined) =>
    countryCode !== undefined && affiliateTagFor(tags, countryCode) !== null;

  // What each chip shows when it is picked explicitly.
  const views = {} as Record<StoreCode, StoreView | null>;
  for (const code of STORE_CODES) {
    const link = findLink(product.product_links, code);
    views[code] = buildStoreView({ link, storeCode: code, goStore: code, affiliate: hasAffiliate(link?.country_code) });
  }

  // What the page shows first (may be the Indonesia fallback, which counts as US).
  const initialView = buildStoreView({
    link: selection.link,
    storeCode: selection.storeCode,
    goStore: selection.goStore,
    affiliate: hasAffiliate(selection.link?.country_code),
  });

  const offer: ProductOffer | null = initialView
    ? { price: initialView.price, currency: initialView.currency, inStock: initialView.inStock }
    : null;

  const images = getProductImages(product);
  const categoryName = product.category?.name ?? null;
  const canonicalUrl = absoluteUrl(`/products/${product.slug}`);
  const mainImageUrl = images[0] ? absoluteUrl(images[0]) : null;
  const pinterestSaveUrl = mainImageUrl
    ? `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(canonicalUrl)}&media=${encodeURIComponent(mainImageUrl)}&description=${encodeURIComponent(product.name)}`
    : null;

  return (
    <PageContainer>
      <ProductStructuredData
        name={product.name}
        slug={product.slug}
        description={product.description}
        images={images}
        categoryName={categoryName}
        offer={offer}
      />

      <div className="mx-auto grid max-w-[1100px] gap-8 md:grid-cols-2 md:items-start md:gap-12">
        <ProductGallery images={images} name={product.name} />
        <ProductInfo
          // A new server-side selection (e.g. after changing country) resets the chips.
          key={`${initialView?.storeCode ?? 'none'}:${initialView?.goStore ?? 'default'}:${initialView?.inStock ?? 'none'}`}
          productId={product.id}
          name={product.name}
          description={product.description}
          categoryName={categoryName}
          views={views}
          initialView={initialView}
          pinterestSaveUrl={pinterestSaveUrl}
        />
      </div>

      <div className="mt-14 space-y-14 md:mt-24 md:space-y-24">
        <TrendingRow products={related} country={visitorCountry} />
        <ShopByCountry />
      </div>
    </PageContainer>
  );
}
