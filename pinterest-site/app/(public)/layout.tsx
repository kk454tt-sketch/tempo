import type { ReactNode } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { CountryScope } from "@/components/providers/CountryScope";

// Every public page uses per-request country headers/cookies and middleware CSP nonces.
// Catalog DB queries inside remain cached for 60s via unstable_cache.
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <CountryScope>
      <PublicShell>{children}</PublicShell>
    </CountryScope>
  );
}
