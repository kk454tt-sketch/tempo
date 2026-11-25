import { AccountCard } from "@/components/admin/settings/AccountCard";
import { AffiliateTagsCard } from "@/components/admin/settings/AffiliateTagsCard";
import { CategoriesCard, type CategoryRow } from "@/components/admin/settings/CategoriesCard";
import { AFFILIATE_COUNTRIES, type AffiliateCountry } from "@/lib/affiliate";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Settings | AffHub Admin",
  description: "Categories, affiliate tags and account settings.",
  path: "/admin/settings",
  noindex: true,
});

type CategoryQueryRow = { id: string; name: string; slug: string; products: { count: number }[] | null };

export default async function SettingsPage() {
  const supabase = await createClient();
  const [categoriesResult, tagsResult, userResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, products(count)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true }),
    supabase.from("store_settings").select("country_code, affiliate_tag"),
    supabase.auth.getUser(),
  ]);

  const categories: CategoryRow[] = ((categoriesResult.data ?? []) as CategoryQueryRow[]).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c.products?.[0]?.count ?? 0,
  }));

  const tags = Object.fromEntries(AFFILIATE_COUNTRIES.map((code) => [code, ""])) as Record<AffiliateCountry, string>;
  for (const row of (tagsResult.data ?? []) as { country_code: string; affiliate_tag: string | null }[]) {
    if ((AFFILIATE_COUNTRIES as readonly string[]).includes(row.country_code)) {
      tags[row.country_code as AffiliateCountry] = row.affiliate_tag ?? "";
    }
  }

  const loadFailed = Boolean(categoriesResult.error || tagsResult.error);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-headline-md font-bold text-primary">Settings</h1>
      {loadFailed && (
        <p role="alert" className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-body-md text-red-700">
          Some settings could not be loaded. Reload the page to try again.
        </p>
      )}
      <CategoriesCard categories={categories} />
      <AffiliateTagsCard initial={tags} />
      <AccountCard email={userResult.data.user?.email ?? ""} />
    </div>
  );
}
