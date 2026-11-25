import { buildProductJsonLd, type ProductOffer } from '@/lib/seo';

type Props = {
  name: string;
  slug: string;
  description: string | null;
  /** Main image first. */
  images: string[];
  categoryName: string | null;
  /** The offer for the store being shown, or null when the product has no link. */
  offer: ProductOffer | null;
};

/**
 * og:type "product", the product:* tags Pinterest reads, and Product JSON-LD.
 * The Metadata API cannot express og:type "product", so these are plain tags
 * (React hoists <meta> into <head>). Title, description, og:image, canonical
 * and Twitter tags come from generateMetadata.
 */
export default function ProductStructuredData({ offer, ...product }: Props) {
  const jsonLd = buildProductJsonLd({ ...product, offer });

  return (
    <>
      <meta property="og:type" content="product" />
      {offer && offer.price !== null && offer.currency && (
        <>
          <meta property="product:price:amount" content={String(offer.price)} />
          <meta property="product:price:currency" content={offer.currency} />
        </>
      )}
      {offer && <meta property="product:availability" content={offer.inStock ? 'in stock' : 'out of stock'} />}
      <script
        type="application/ld+json"
        // "<" is escaped so a description can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </>
  );
}
