import { ProsePage, ProseSection } from "@/components/layout/ProsePage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact | AffHub",
  description: "How to get in touch with AffHub.",
  path: "/contact",
});

export default function ContactPage() {
  // NEXT_PUBLIC_ values are inlined at build time: after changing the email, redeploy.
  // No address is hard-coded anywhere.
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  return (
    <ProsePage title="Contact">
      <ProseSection title="Get in touch">
        {email ? (
          <p>
            Questions, corrections or a link that does not work? Email <a href={`mailto:${email}`}>{email}</a>.
          </p>
        ) : (
          <p>No contact address has been published yet.</p>
        )}
      </ProseSection>
    </ProsePage>
  );
}
