/**
 * Store (Amazon marketplace) selection for product pages and the /go route.
 * Pure helpers: no server-only imports, so client components can use them too.
 *
 * The four selectable stores are US, IN, BR and MX. "ID" only ever exists as a
 * product_links row (the optional Indonesia fallback link); it opens Amazon US.
 */

export const STORE_CODES = ['US', 'IN', 'BR', 'MX'] as const;
export type StoreCode = (typeof STORE_CODES)[number];

export type StoreMeta = {
  code: StoreCode;
  /** Used in "Buy on Amazon {amazonName}" and "Opens Amazon {amazonName}". */
  amazonName: string;
  /** Used in "Out of stock in {inLabel}". */
  inLabel: string;
};

export const STORES: Record<StoreCode, StoreMeta> = {
  US: { code: 'US', amazonName: 'US', inLabel: 'the US' },
  IN: { code: 'IN', amazonName: 'India', inLabel: 'India' },
  BR: { code: 'BR', amazonName: 'Brazil', inLabel: 'Brazil' },
  MX: { code: 'MX', amazonName: 'Mexico', inLabel: 'Mexico' },
};

export function isStoreCode(value: string | null | undefined): value is StoreCode {
  return (STORE_CODES as readonly string[]).includes(value ?? '');
}

/** Reads ?store=XX. Only US, IN, BR and MX are valid overrides. */
export function parseStoreParam(value: string | string[] | null | undefined): StoreCode | null {
  const raw = (Array.isArray(value) ? value[0] : value)?.trim().toUpperCase();
  return isStoreCode(raw) ? raw : null;
}

/* -------------------------------------------------------------------------- */
/* Link selection (shared by the product page and /go)                        */
/* -------------------------------------------------------------------------- */

type LinkLike = { country_code: string };

export function findLink<T extends LinkLike>(links: readonly T[], code: string): T | undefined {
  return links.find((link) => link.country_code === code);
}

function firstAvailable<T extends LinkLike>(links: readonly T[]): T | null {
  for (const code of STORE_CODES) {
    const link = findLink(links, code);
    if (link) return link;
  }
  return findLink(links, 'ID') ?? links[0] ?? null;
}

/**
 * Picks the product link for a visit.
 *  1. A valid store override (US, IN, BR, MX) wins when the product has that link.
 *  2. A visitor in US, IN, BR or MX gets their own store, then US.
 *  3. Indonesia and unknown countries get the ID fallback link, then US.
 *  4. As a last resort, any link the product has.
 */
export function pickLink<T extends LinkLike>(
  links: readonly T[],
  visitorCountry: string,
  storeOverride: StoreCode | null = null,
): T | null {
  if (storeOverride) {
    const overridden = findLink(links, storeOverride);
    if (overridden) return overridden;
  }

  if (isStoreCode(visitorCountry)) {
    return findLink(links, visitorCountry) ?? findLink(links, 'US') ?? firstAvailable(links);
  }

  return findLink(links, 'ID') ?? findLink(links, 'US') ?? firstAvailable(links);
}

export type StoreSelection<T extends LinkLike> = {
  link: T | null;
  /** The store shown to the visitor. The ID fallback link counts as "US". */
  storeCode: StoreCode | null;
  /**
   * The ?store= value the buy button must send to /go, or null when /go
   * should decide from the visitor's country (Indonesia and unknown visitors).
   */
  goStore: StoreCode | null;
};

export function selectStore<T extends LinkLike>(
  links: readonly T[],
  visitorCountry: string,
  storeOverride: StoreCode | null,
): StoreSelection<T> {
  const link = pickLink(links, visitorCountry, storeOverride);
  if (!link) return { link: null, storeCode: null, goStore: null };

  const linkIsStore = isStoreCode(link.country_code);
  const storeCode: StoreCode = isStoreCode(link.country_code) ? link.country_code : 'US';
  const wasOverridden = storeOverride !== null && link.country_code === storeOverride;
  const goStore = linkIsStore && (wasOverridden || isStoreCode(visitorCountry)) ? storeCode : null;

  return { link, storeCode, goStore };
}

/* -------------------------------------------------------------------------- */
/* View model sent to the client                                              */
/* -------------------------------------------------------------------------- */

/** Everything the buy panel needs for one store. Contains no Amazon URL and no affiliate tag. */
export type StoreView = {
  storeCode: StoreCode;
  price: number | null;
  currency: string | null;
  inStock: boolean;
  /** True when an affiliate tag exists for this store (shows the earnings caption). */
  affiliate: boolean;
  goStore: StoreCode | null;
};

type StoreLinkData = LinkLike & {
  price: number | null;
  currency: string | null;
  in_stock: boolean;
};

export function buildStoreView(input: {
  link: StoreLinkData | null | undefined;
  storeCode: StoreCode | null;
  goStore: StoreCode | null;
  affiliate: boolean;
}): StoreView | null {
  const { link, storeCode, goStore, affiliate } = input;
  if (!link || !storeCode) return null;

  return {
    storeCode,
    price: link.price === null || link.price === undefined ? null : Number(link.price),
    currency: link.currency,
    inStock: link.in_stock,
    affiliate,
    goStore,
  };
}

/** "$1,299.00", "₹1,299.00", "R$1,299.00", "MX$1,299.00". */
export function formatPrice(amount: number, currency: string | null | undefined): string {
  const code = currency || 'USD';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}
