import type { Metadata } from "next";
import { COOKIES, EVENT_FIELDS, NOT_STORED, retentionDays } from "@/lib/privacy/inventory";
import { RATE_LIMITS } from "@/lib/rate-limit";

export const metadata: Metadata = { title: "Privacy" };
// Rendered from env (retention days) at request time; cheap and always accurate.
export const dynamic = "force-dynamic";

const limitWindows = `${RATE_LIMITS.go.windowSeconds} seconds to ${RATE_LIMITS.passwordChange.windowSeconds / 3600} hour`;

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className="border-b border-neutral-500/40 py-2 pr-4 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) => (
                <td key={i} className="border-b border-neutral-500/20 py-2 pr-4 align-top">
                  {i === 0 ? <code>{c}</code> : c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  const days = retentionDays();
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Privacy</h1>
        <p>
          AffHub shows product links for the Amazon store that matches your country. To understand which products and
          countries get attention, we record a small number of anonymous events. This page lists everything we store.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What we do not store</h2>
        <ul className="list-disc space-y-1 pl-6">
          {NOT_STORED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Cookies</h2>
        <p>
          We do not use third-party advertising or cross-site tracking cookies. The only cookies this site sets are the
          first-party and admin session cookies listed below.
        </p>
        <Table
          head={["Cookie", "Purpose", "Set for", "Lifetime"]}
          rows={COOKIES.map((c) => [c.prefix ? `${c.name}*` : c.name, c.purpose, c.setFor, c.duration])}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Event data (analytics)</h2>
        <p>
          Each page view or click on an Amazon button stores one row with exactly these fields. Rows are deleted
          automatically after {days} days.
        </p>
        <Table head={["Field", "What it holds"]} rows={EVENT_FIELDS.map((f) => [f.column, f.meaning])} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Abuse protection</h2>
        <p>
          To stop automated abuse, we count requests per visitor. For that, a salted one-way hash of your IP address
          is used as a counter key and kept only for the length of the counting window ({limitWindows}, depending on the
          action). The IP address itself is never stored by us, and the hash cannot be turned back into an IP address
          without our secret salt.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Other parties</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Hosting and database.</strong> The site runs on Vercel and stores data in Supabase. Like any web
            host, they process IP addresses to deliver pages and secure their networks, under their own privacy
            policies. We do not receive or keep those IP addresses.
          </li>
          <li>
            <strong>Amazon.</strong> When you click a product button you leave this site and Amazon&rsquo;s own privacy
            notice applies.
          </li>
        </ul>
      </section>
    </div>
  );
}
