import { z } from 'zod';
import { isAllowedHost } from '@/lib/url-allowlist';
import { SHORT_LINK_HOSTS, STORES, STORE_CODES, type CountryCode } from './stores';
import { MAX_GALLERY } from './storage';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const isUuid = (value: string): boolean => UUID_RE.test(value);

export type FieldErrors = Record<string, string>;
export type ActionResult = { ok: true } | { ok: false; message: string };
export type SaveResult =
  | { ok: true; slug: string; slugChanged: boolean }
  | { ok: false; message: string; fieldErrors?: FieldErrors };
export interface CategoryOption {
  id: string;
  name: string;
}

export function validateAmazonUrl(raw: string, code: CountryCode): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return 'Enter a full link that starts with https://';
  }
  if (url.protocol !== 'https:') return 'The link must start with https://';
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const store = STORES[code];
  if (isAllowedHost(raw) && (store.hosts.includes(host) || (SHORT_LINK_HOSTS as readonly string[]).includes(host))) {
    return null;
  }
  return `Use an ${store.hosts[0]} link or an Amazon short link (${SHORT_LINK_HOSTS.join(', ')}).`;
}

export function parsePrice(raw: string): { value: number | null; error?: string } {
  const text = raw.trim();
  if (!text) return { value: null };
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(text)) return { value: null, error: 'Enter a number like 19.99 (0 or more).' };
  return { value: Number(text) };
}

function linkField(code: CountryCode) {
  return z.object({
    url: z
      .string()
      .max(2048, 'This link is too long.')
      .superRefine((value, ctx) => {
        const text = value.trim();
        if (!text) return;
        const problem = validateAmazonUrl(text, code);
        if (problem) ctx.addIssue({ code: 'custom', message: problem });
      }),
    price: z
      .string()
      .max(20, 'Enter a number like 19.99 (0 or more).')
      .superRefine((value, ctx) => {
        const { error } = parsePrice(value);
        if (error) ctx.addIssue({ code: 'custom', message: error });
      }),
    inStock: z.boolean(),
  });
}

export const productSchema = z.object({
  id: z.string().refine(isUuid, 'Invalid product id.'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(120, 'Name must be 120 characters or fewer.'),
  categoryId: z.string().refine((v) => v === '' || isUuid(v), 'Choose a valid category.'),
  imageUrl: z.string().max(2048),
  galleryUrls: z.array(z.string().max(2048)).max(MAX_GALLERY, `Add up to ${MAX_GALLERY} extra images.`),
  description: z.string().max(400, 'Description must be 400 characters or fewer.'),
  slug: z
    .string()
    .trim()
    .max(120, 'Slug must be 120 characters or fewer.')
    .refine((v) => v === '' || SLUG_RE.test(v), 'Use lowercase letters, numbers and single hyphens.'),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  links: z.object({
    US: linkField('US'),
    IN: linkField('IN'),
    BR: linkField('BR'),
    MX: linkField('MX'),
    ID: linkField('ID'),
  }),
});

export type ProductInput = z.infer<typeof productSchema>;
export type LinkValue = ProductInput['links'][CountryCode];

export function emptyProductInput(id: string): ProductInput {
  const blank = (): LinkValue => ({ url: '', price: '', inStock: true });
  return {
    id,
    name: '',
    categoryId: '',
    imageUrl: '',
    galleryUrls: [],
    description: '',
    slug: '',
    isPublished: true,
    isFeatured: false,
    links: { US: blank(), IN: blank(), BR: blank(), MX: blank(), ID: blank() },
  };
}

/** Rules that look at more than one field. Written defensively: the server passes untrusted input. */
function crossFieldErrors(v: Partial<ProductInput>): FieldErrors {
  const errors: FieldErrors = {};
  const links = v.links;
  if (!STORE_CODES.some((code) => (links?.[code]?.url ?? '').trim() !== '')) {
    errors.links = 'Add at least one Amazon link (US, IN, BR or MX).';
  }
  for (const code of STORE_CODES) {
    const link = links?.[code];
    if (link && !link.url.trim() && link.price.trim()) {
      errors[`links.${code}.url`] = 'Add the link for this price, or clear the price.';
    }
  }
  if (v.isPublished && !(v.imageUrl ?? '').trim()) {
    errors.imageUrl = 'Add a main image to publish this product.';
  }
  return errors;
}

/** Same function runs in the browser (instant messages) and on the server (the real check). */
export function validateProduct(raw: unknown): { data: ProductInput | null; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path.map(String).join('.');
      if (!(key in errors)) errors[key] = issue.message;
    }
  }
  try {
    const extra = crossFieldErrors((parsed.success ? parsed.data : raw) as Partial<ProductInput>);
    for (const [key, message] of Object.entries(extra)) if (!(key in errors)) errors[key] = message;
  } catch {
    // malformed payload: the schema errors above already describe it
  }
  return { data: parsed.success && Object.keys(errors).length === 0 ? parsed.data : null, errors };
}

