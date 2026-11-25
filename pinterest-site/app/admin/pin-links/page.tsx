import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PinLinksBuilder, type PinProductOption } from "@/components/admin/PinLinksBuilder";
import { requireAdmin } from "@/lib/admin/auth";
import { siteUrl } from "@/lib/seo";

export const metadata = { title: "Pin links" };

export default async function PinLinksPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, image_url")
    .eq("is_published", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Could not load published products: ${error.message}`);
  }

  const products = (data ?? []) as PinProductOption[];

  return (
    <>
      <AdminPageHeader title="Pin links" />
      <p className="-mt-5 mb-6 text-body-sm text-[#64748B]">
        Generate tracked Pinterest links that open each product in the visitor&apos;s own country store.
      </p>
      <PinLinksBuilder products={products} baseUrl={siteUrl()} />
    </>
  );
}
