import { CountryShop } from "@/components/home/CountryShop";
import { Hero } from "@/components/home/Hero";
import { HomeStack } from "@/components/home/HomeStack";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ProductGrid } from "@/components/home/ProductGrid";
import { getVisitorCountry } from "@/lib/country";
import { getHomeProducts } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";
import { pinterestVerifyMetadata } from "@/lib/seo/pinterest-verify";

const TITLE = "AffHub × Amazon | Curated finds";
const DESCRIPTION = "Curated Amazon finds, linked to your country's store.";

export const metadata = {
  ...pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/" }),
  ...pinterestVerifyMetadata(),
};

export default async function HomePage() {
  const [country, products] = await Promise.all([getVisitorCountry(), getHomeProducts()]);
  // Query order is featured first, newest first, so the first featured item is the newest one.
  const featured = products.find((p) => p.is_featured) ?? null;

  return (
    <HomeStack>
      <Hero featured={featured} country={country} />
      <ProductGrid products={products} country={country} />
      <CountryShop />
      <HowItWorks />
    </HomeStack>
  );
}
