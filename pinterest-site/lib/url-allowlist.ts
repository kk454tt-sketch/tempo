export const ALLOWED_STORE_HOSTS = ["amazon.com", "amazon.in", "amazon.com.br", "amazon.com.mx"] as const;
export const SHORT_LINK_HOSTS = ["amzn.to", "amzn.in", "a.co", "amzn.eu"] as const;

const ALL_ALLOWED_HOSTS: ReadonlySet<string> = new Set([
  ...ALLOWED_STORE_HOSTS,
  ...SHORT_LINK_HOSTS,
]);

function normalizeHost(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return null;
    return parsed.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function isShortLinkHost(rawUrl: string): boolean {
  const host = normalizeHost(rawUrl);
  return host !== null && (SHORT_LINK_HOSTS as readonly string[]).includes(host);
}

export function isAllowedHost(rawUrl: string): boolean {
  const host = normalizeHost(rawUrl);
  return host !== null && ALL_ALLOWED_HOSTS.has(host);
}
