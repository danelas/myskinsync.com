// Live price layer. Fetches current price/availability from the Amazon Creators
// API, cached for 6h (well under Amazon's 24h staleness rule). Degrades to {} if
// credentials aren't set, the account isn't eligible yet, or a product has no ASIN
// — so the site never breaks; price just doesn't render.
import { unstable_cache } from "next/cache";
import { getItems } from "./creators-api";

export interface PriceInfo {
  price?: string;
  available?: string;
  fetchedAt: string; // ISO — shown as "as of …" for compliance
}

async function fetchPrices(asins: string[]): Promise<Record<string, PriceInfo>> {
  try {
    const items = await getItems(asins, ["offersV2.listings.price", "offersV2.listings.availability"]);
    const now = new Date().toISOString();
    const out: Record<string, PriceInfo> = {};
    for (const it of items) {
      if (it.asin && it.price) out[it.asin] = { price: it.price, available: it.available, fetchedAt: now };
    }
    return out;
  } catch (e) {
    console.warn("[price] fetch failed:", (e as Error).message);
    return {};
  }
}

const SIX_HOURS = 21600;

export async function getPrices(asins: string[]): Promise<Record<string, PriceInfo>> {
  const key = [...new Set(asins.filter(Boolean))].sort();
  if (key.length === 0) return {};
  const cached = unstable_cache(() => fetchPrices(key), ["amazon-prices", ...key], {
    revalidate: SIX_HOURS,
  });
  return cached();
}
