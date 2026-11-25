import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

/** Wrapper for plain text pages (About, Contact, Privacy). PublicShell comes from app/(public)/layout.tsx. */
export function ProsePage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="pb-14 pt-6 lg:pb-24 lg:pt-16">
      <Container>
        <div className="max-w-[720px]">
          <h1 className="text-headline-xl-mobile font-extrabold text-primary lg:text-headline-xl">{title}</h1>
          {intro && <p className="mt-3 text-body-lg text-on-surface-variant">{intro}</p>}
          <div className="mt-10 flex flex-col gap-10">{children}</div>
        </div>
      </Container>
    </div>
  );
}

export function ProseSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-headline-md font-bold text-primary">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body-lg text-on-surface [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-6">
        {children}
      </div>
    </section>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-[6px] bg-surface-container px-1.5 py-0.5 text-[0.9em]">{children}</code>;
}
