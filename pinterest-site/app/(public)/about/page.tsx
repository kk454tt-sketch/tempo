import Link from "next/link";
import { ProsePage, ProseSection } from "@/components/layout/ProsePage";
import { buttonClass } from "@/components/ui/button-styles";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About | AffHub",
  description: "AffHub is a curated list of Amazon products, linked to your country’s Amazon store.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <ProsePage title="About AffHub" intro="A curated list of Amazon products, each linked to the Amazon store for your country.">
      <ProseSection title="What AffHub is">
        <p>
          AffHub is a short, curated list of products available on Amazon. Each product is added to the list
          individually, with its own link, price and stock status for every store we support.
        </p>
      </ProseSection>

      <ProseSection title="Your country’s store">
        <p>
          When you open a product, AffHub shows the price and stock status for the Amazon store in your country:
          Amazon US, India, Brazil or Mexico. Indonesia has no Amazon store, so visitors from Indonesia are sent to
          Amazon US. Visitors from any other country also see Amazon US.
        </p>
        <p>You can change your country at any time with the country button at the top of every page.</p>
      </ProseSection>

      <ProseSection title="Buying">
        <p>
          AffHub does not sell anything. When you choose to buy, you are taken to Amazon and finish the purchase
          there. Prices and availability can change on Amazon at any time; the price shown on Amazon when you buy is
          the one that applies.
        </p>
      </ProseSection>

      <ProseSection title="How AffHub is funded">
        <p>
          As an Amazon Associate, we may earn from qualifying purchases. It costs you nothing extra. Read what data we
          keep on the <Link href="/privacy">privacy page</Link>.
        </p>
      </ProseSection>

      <div>
        <Link href="/products" className={buttonClass("primary")}>
          Browse products
        </Link>
      </div>
    </ProsePage>
  );
}
