import type { Product } from "./types";

/**
 * Affiliate-link layer — deliberately abstracted behind one function so the
 * storefront never hard-codes Amazon. Today every link is an Amazon Associates
 * link; tomorrow a product can carry a direct brand-program URL (Impact /
 * ShareASale / Rakuten, 8–15% vs Amazon's 3%) and we just add a branch here.
 */
export const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || "dpop07-20";

export function affiliateUrl(p: Product): string {
  // Direct product link if we know the ASIN (best — Amazon counts the 24h cart).
  if (p.asin) {
    return `https://www.amazon.com/dp/${p.asin}/?tag=${AMAZON_TAG}`;
  }
  // Phase-1 fallback: tagged Amazon search. Works before we have ASINs / PA-API.
  const q = encodeURIComponent(p.searchTerms || `${p.brand} ${p.name}`);
  return `https://www.amazon.com/s?k=${q}&tag=${AMAZON_TAG}`;
}

/** Rel + target every affiliate link must carry for compliance + SEO hygiene. */
export const AFFILIATE_LINK_PROPS = {
  target: "_blank" as const,
  rel: "sponsored nofollow noopener noreferrer",
};
