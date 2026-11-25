import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { ui } from "@/components/ui/classes";
import { getAdminSession } from "@/lib/admin/auth";
import { safeNextPath } from "@/lib/admin/paths";

export const metadata = { title: "Sign in" };

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = safeNextPath(rawNext);

  if (await getAdminSession()) redirect(next);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className={`w-full max-w-[400px] p-10 ${ui.card}`}>
        <h1 className="mb-8 text-center text-headline-md font-bold text-[#0F172A]">AffHub</h1>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
