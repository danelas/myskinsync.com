// Resolve our curated catalog to real Amazon data via the Creators API and write
// content/products-live.json (id → { asin, image, title, price }). The site reads
// it to use direct /dp/<asin> links + real product images.
//
// We store asin + image (durable, cache-safe). Price is fetched for reference but
// the site does NOT display it (so we never risk Amazon's 24h price-staleness rule).
//
// Usage:  ANTHROPIC… not needed. Set AMAZON_* env, then:
//   cd agent && npm run sync
import dotenv from "dotenv";
dotenv.config({ override: true });

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { searchItems, loadCreds, type LiveItem } from "./creators-api.ts";

// Keep ids + searchTerms in sync with ../lib/products.ts.
const CATALOG: { id: string; q: string }[] = [
  { id: "cerave-hydrating-cleanser", q: "CeraVe Hydrating Facial Cleanser" },
  { id: "cerave-foaming-cleanser", q: "CeraVe Foaming Facial Cleanser" },
  { id: "vanicream-cleanser", q: "Vanicream Gentle Facial Cleanser" },
  { id: "to-niacinamide", q: "The Ordinary Niacinamide 10% Zinc" },
  { id: "to-hyaluronic", q: "The Ordinary Hyaluronic Acid 2% B5" },
  { id: "to-azelaic", q: "The Ordinary Azelaic Acid Suspension 10%" },
  { id: "to-retinoid", q: "The Ordinary Granactive Retinoid 2% Emulsion" },
  { id: "differin-gel", q: "Differin Adapalene Gel 0.1%" },
  { id: "lrp-cicaplast", q: "La Roche-Posay Cicaplast Balm B5" },
  { id: "paulas-bha", q: "Paula's Choice 2% BHA Liquid Exfoliant" },
  { id: "cerave-cream", q: "CeraVe Moisturizing Cream" },
  { id: "cerave-pm-lotion", q: "CeraVe PM Facial Moisturizing Lotion" },
  { id: "boj-relief-sun", q: "Beauty of Joseon Relief Sun SPF50" },
  { id: "lrp-anthelios", q: "La Roche-Posay Anthelios Melt-in Milk SPF 60" },
  { id: "eltamd-uv-clear", q: "EltaMD UV Clear SPF 46 sunscreen" },
];

const OUT = resolve(process.cwd(), "..", "content", "products-live.json");

async function main() {
  const creds = loadCreds();
  const live: Record<string, { asin: string; image?: string; title?: string; price?: string; fetchedAt: string }> = {};
  const now = new Date().toISOString();
  let ok = 0;

  for (const item of CATALOG) {
    try {
      const results: LiveItem[] = await searchItems(item.q, creds, { itemCount: 1 });
      const top = results[0];
      if (top?.asin) {
        live[item.id] = { asin: top.asin, image: top.image, title: top.title, price: top.price, fetchedAt: now };
        ok++;
        console.log(`✓ ${item.id} → ${top.asin}${top.image ? " (image)" : ""}`);
      } else {
        console.warn(`· ${item.id}: no result for "${item.q}"`);
      }
    } catch (e) {
      console.error(`✗ ${item.id}: ${(e as Error).message}`);
    }
    // Gentle pacing — the API is rate-limited (especially for new accounts).
    await new Promise((r) => setTimeout(r, 1100));
  }

  await writeFile(OUT, JSON.stringify(live, null, 2) + "\n", "utf8");
  console.log(`\nWrote ${OUT} — ${ok}/${CATALOG.length} products resolved.`);
}

main().catch((e) => {
  console.error("[sync] fatal:", e.message);
  process.exit(1);
});
