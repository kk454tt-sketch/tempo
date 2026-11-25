// Admin-side store config: only what the product form needs (hosts to validate, placeholders).
// Currency/symbol match lib/countries.ts; point these at it if you prefer a single source.

export const STORE_CODES = ['US', 'IN', 'BR', 'MX'] as const;
export const ALL_CODES = ['US', 'IN', 'BR', 'MX', 'ID'] as const;
export type StoreCode = (typeof STORE_CODES)[number];
export type CountryCode = (typeof ALL_CODES)[number];

export interface StoreConfig {
  code: CountryCode;
  name: string;
  currency: string;
  symbol: string;
  placeholder: string;
  /** Allowed hosts (without "www.") for this row. */
  hosts: readonly string[];
}

export const STORES: Record<CountryCode, StoreConfig> = {
  US: { code: 'US', name: 'United States', currency: 'USD', symbol: '$', placeholder: 'https://amazon.com/dp/...', hosts: ['amazon.com'] },
  IN: { code: 'IN', name: 'India', currency: 'INR', symbol: '₹', placeholder: 'https://amazon.in/dp/...', hosts: ['amazon.in'] },
  BR: { code: 'BR', name: 'Brazil', currency: 'BRL', symbol: 'R$', placeholder: 'https://amazon.com.br/dp/...', hosts: ['amazon.com.br'] },
  MX: { code: 'MX', name: 'Mexico', currency: 'MXN', symbol: 'MX$', placeholder: 'https://amazon.com.mx/dp/...', hosts: ['amazon.com.mx'] },
  // Indonesia has no store: the fallback must be a US link.
  ID: { code: 'ID', name: 'Indonesia', currency: 'USD', symbol: '$', placeholder: 'https://amazon.com/dp/... (defaults to US store)', hosts: ['amazon.com'] },
};

export const SHORT_LINK_HOSTS = ['amzn.to', 'amzn.in', 'a.co', 'amzn.eu'] as const;

export function isCountryCode(value: string): value is CountryCode {
  return (ALL_CODES as readonly string[]).includes(value);
}
