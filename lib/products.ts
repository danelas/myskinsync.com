import type { Product } from "./types";
import liveData from "@/content/products-live.json";

/**
 * Seed catalog — every product here was surfaced by The Listener as something
 * real people are actively asking about (see the-listener/briefs/brief_skincare).
 * `popularity` = demand mentions from that brief. Add `asin` per product when
 * you have it; until then links fall back to tagged Amazon search.
 */
export const PRODUCTS: Product[] = [
  // ---- Cleansers ----
  {
    id: "cerave-hydrating-cleanser",
    brand: "CeraVe",
    name: "Hydrating Facial Cleanser",
    step: "cleanser",
    skinTypes: ["dry", "normal", "combination"],
    concerns: ["dryness"],
    sensitiveSafe: true,
    budget: "budget",
    popularity: 34,
    searchTerms: "CeraVe Hydrating Facial Cleanser",
    blurb: "Non-foaming, ceramide-rich cleanse that won't strip the barrier.",
  },
  {
    id: "cerave-foaming-cleanser",
    brand: "CeraVe",
    name: "Foaming Facial Cleanser",
    step: "cleanser",
    skinTypes: ["oily", "combination"],
    concerns: ["acne", "texture"],
    sensitiveSafe: false,
    budget: "budget",
    popularity: 34,
    searchTerms: "CeraVe Foaming Facial Cleanser",
    blurb: "Removes excess oil without that tight, squeaky feeling.",
  },
  {
    id: "vanicream-cleanser",
    brand: "Vanicream",
    name: "Gentle Facial Cleanser",
    step: "cleanser",
    skinTypes: ["all"],
    concerns: ["redness"],
    sensitiveSafe: true,
    budget: "budget",
    popularity: 7,
    searchTerms: "Vanicream Gentle Facial Cleanser",
    blurb: "Free of dyes, fragrance, and common irritants — reactive-skin safe.",
  },

  // ---- Treatments / serums ----
  {
    id: "to-niacinamide",
    brand: "The Ordinary",
    name: "Niacinamide 10% + Zinc 1%",
    step: "treatment",
    phase: "am",
    skinTypes: ["oily", "combination"],
    concerns: ["acne", "texture"],
    sensitiveSafe: true,
    budget: "budget",
    popularity: 20,
    searchTerms: "The Ordinary Niacinamide 10% Zinc",
    blurb: "Calms oil and visibly tightens pores. A gentle daytime workhorse.",
  },
  {
    id: "to-hyaluronic",
    brand: "The Ordinary",
    name: "Hyaluronic Acid 2% + B5",
    step: "treatment",
    phase: "both",
    skinTypes: ["dry", "normal", "combination"],
    concerns: ["dryness"],
    sensitiveSafe: true,
    budget: "budget",
    popularity: 20,
    searchTerms: "The Ordinary Hyaluronic Acid 2% B5",
    blurb: "Pulls water into the skin for that plump, hydrated look.",
  },
  {
    id: "to-azelaic",
    brand: "The Ordinary",
    name: "Azelaic Acid Suspension 10%",
    step: "treatment",
    phase: "pm",
    skinTypes: ["all"],
    concerns: ["redness", "darkspots", "acne"],
    sensitiveSafe: true,
    budget: "budget",
    popularity: 9,
    searchTerms: "The Ordinary Azelaic Acid Suspension 10%",
    blurb: "Multitasker for redness, marks, and breakouts — gentle enough daily.",
  },
  {
    id: "to-retinoid",
    brand: "The Ordinary",
    name: "Granactive Retinoid 2% Emulsion",
    step: "treatment",
    phase: "pm",
    skinTypes: ["all"],
    concerns: ["aging"],
    sensitiveSafe: false,
    budget: "mid",
    popularity: 5,
    searchTerms: "The Ordinary Granactive Retinoid 2% Emulsion",
    blurb: "Smooths fine lines and texture with less irritation than tretinoin.",
  },
  {
    id: "differin-gel",
    brand: "Differin",
    name: "Adapalene Gel 0.1%",
    step: "treatment",
    phase: "pm",
    skinTypes: ["oily", "combination"],
    concerns: ["acne"],
    sensitiveSafe: false,
    budget: "mid",
    popularity: 4,
    searchTerms: "Differin Adapalene Gel 0.1% acne treatment",
    blurb: "OTC prescription-strength retinoid — the gold standard for breakouts.",
  },
  {
    id: "lrp-cicaplast",
    brand: "La Roche-Posay",
    name: "Cicaplast Balm B5",
    step: "treatment",
    phase: "both",
    skinTypes: ["sensitive", "dry"],
    concerns: ["redness", "dryness"],
    sensitiveSafe: true,
    budget: "mid",
    popularity: 13,
    searchTerms: "La Roche-Posay Cicaplast Balm B5",
    blurb: "Soothing barrier balm for irritated, compromised, reactive skin.",
  },

  // ---- Exfoliant ----
  {
    id: "paulas-bha",
    brand: "Paula's Choice",
    name: "Skin Perfecting 2% BHA Liquid Exfoliant",
    step: "exfoliant",
    skinTypes: ["oily", "combination"],
    concerns: ["acne", "texture"],
    sensitiveSafe: false,
    budget: "mid",
    popularity: 9,
    searchTerms: "Paula's Choice 2% BHA Liquid Exfoliant",
    blurb: "Unclogs pores and smooths texture. Start 2–3x a week.",
  },

  // ---- Moisturizers ----
  {
    id: "cerave-cream",
    brand: "CeraVe",
    name: "Moisturizing Cream",
    step: "moisturizer",
    skinTypes: ["dry", "normal", "sensitive"],
    concerns: ["dryness"],
    sensitiveSafe: true,
    budget: "budget",
    popularity: 34,
    searchTerms: "CeraVe Moisturizing Cream tub",
    blurb: "Rich ceramide cream that seals in moisture overnight.",
  },
  {
    id: "cerave-pm-lotion",
    brand: "CeraVe",
    name: "PM Facial Moisturizing Lotion",
    step: "moisturizer",
    skinTypes: ["oily", "combination", "normal"],
    concerns: ["texture"],
    sensitiveSafe: true,
    budget: "budget",
    popularity: 34,
    searchTerms: "CeraVe PM Facial Moisturizing Lotion",
    blurb: "Lightweight, oil-free hydration with niacinamide. No greasy film.",
  },

  // ---- SPF ----
  {
    id: "boj-relief-sun",
    brand: "Beauty of Joseon",
    name: "Relief Sun SPF50+",
    step: "spf",
    skinTypes: ["all"],
    concerns: [],
    sensitiveSafe: true,
    budget: "budget",
    popularity: 4,
    searchTerms: "Beauty of Joseon Relief Sun SPF50",
    blurb: "Beloved lightweight daily sunscreen with zero white cast.",
  },
  {
    id: "lrp-anthelios",
    brand: "La Roche-Posay",
    name: "Anthelios Melt-in Milk SPF 60",
    step: "spf",
    skinTypes: ["all"],
    concerns: [],
    sensitiveSafe: true,
    budget: "mid",
    popularity: 13,
    searchTerms: "La Roche-Posay Anthelios Melt-in Milk SPF 60",
    blurb: "High, reliable broad-spectrum protection for face and body.",
  },
  {
    id: "eltamd-uv-clear",
    brand: "EltaMD",
    name: "UV Clear SPF 46",
    step: "spf",
    skinTypes: ["sensitive", "oily", "combination"],
    concerns: ["acne", "redness"],
    sensitiveSafe: true,
    budget: "premium",
    popularity: 3,
    searchTerms: "EltaMD UV Clear SPF 46 sunscreen",
    blurb: "Derm-favorite for acne-prone, sensitive skin — niacinamide included.",
  },
];

// Overlay live Amazon data (real ASIN + image) synced by agent/sync-catalog.ts.
// Empty {} until the first sync runs — products then fall back to monogram thumbs
// and tagged-search links. ASIN/image are durable, so this is cache-safe.
type LiveEntry = { asin?: string; image?: string };
const LIVE = liveData as Record<string, LiveEntry>;
for (const p of PRODUCTS) {
  const l = LIVE[p.id];
  if (l?.asin) p.asin = l.asin;
  if (l?.image) p.image = l.image;
}

export const byStep = (step: string) => PRODUCTS.filter((p) => p.step === step);
