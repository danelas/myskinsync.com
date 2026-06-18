/**
 * Guide generator — turns The Listener's content briefs into publishable guides.
 *
 * Reads the bridge brief JSON, and for each high-intent thread that doesn't
 * already have a guide, asks Claude to write a genuinely useful article in the
 * Guide shape (intro, sections, FAQ) and pick featured products from OUR catalog
 * so affiliate links stay consistent. Writes content/guides/<slug>.json.
 *
 * Idempotent: existing slugs are skipped. Token spend is bounded by --limit.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-guides.mjs --limit 5
 *   node scripts/generate-guides.mjs --brief ../the-listener/briefs/brief_skincare_latest.json --limit 10
 *
 * Install dep first:  npm i -D @anthropic-ai/sdk
 */
import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

const args = process.argv.slice(2);
const getArg = (flag, def) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : def;
};
const BRIEF = getArg("--brief", "../the-listener/briefs/brief_skincare_latest.json");
const LIMIT = parseInt(getArg("--limit", "5"), 10);
const OUT_DIR = path.join(process.cwd(), "content", "guides");
const MODEL = "claude-haiku-4-5-20251001";

// Keep this catalog in sync with lib/products.ts — it's what the model may feature.
const CATALOG = [
  { id: "cerave-hydrating-cleanser", label: "CeraVe Hydrating Facial Cleanser (gentle cleanser)" },
  { id: "cerave-foaming-cleanser", label: "CeraVe Foaming Facial Cleanser (oily/combination cleanser)" },
  { id: "vanicream-cleanser", label: "Vanicream Gentle Facial Cleanser (sensitive cleanser)" },
  { id: "to-niacinamide", label: "The Ordinary Niacinamide 10% + Zinc (oil/pores, AM)" },
  { id: "to-hyaluronic", label: "The Ordinary Hyaluronic Acid 2% + B5 (hydration)" },
  { id: "to-azelaic", label: "The Ordinary Azelaic Acid 10% (redness/marks/acne, gentle)" },
  { id: "to-retinoid", label: "The Ordinary Granactive Retinoid 2% (anti-aging, PM)" },
  { id: "differin-gel", label: "Differin Adapalene Gel 0.1% (acne, PM)" },
  { id: "lrp-cicaplast", label: "La Roche-Posay Cicaplast Balm B5 (soothing, sensitive)" },
  { id: "paulas-bha", label: "Paula's Choice 2% BHA Liquid Exfoliant (texture/acne)" },
  { id: "cerave-cream", label: "CeraVe Moisturizing Cream (rich, dry/sensitive)" },
  { id: "cerave-pm-lotion", label: "CeraVe PM Facial Moisturizing Lotion (lightweight)" },
  { id: "boj-relief-sun", label: "Beauty of Joseon Relief Sun SPF50+ (lightweight SPF)" },
  { id: "lrp-anthelios", label: "La Roche-Posay Anthelios SPF 60 (high SPF)" },
  { id: "eltamd-uv-clear", label: "EltaMD UV Clear SPF 46 (sensitive/acne-prone SPF)" },
];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/\[.*?\]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

const SCHEMA = `Return ONLY valid JSON (no markdown fence) matching:
{
  "title": "SEO title, <=65 chars, compelling and specific",
  "description": "meta description, 120-155 chars",
  "concern": "acne|dryness|aging|redness|darkspots|texture",
  "skinType": "dry|oily|combination|normal|sensitive",
  "painQuote": "the real question people ask, cleaned up, no brackets",
  "intro": ["2 short paragraphs that empathize then promise the answer"],
  "sections": [{"h2":"...","body":["1-2 paragraphs"]}],  // 3-4 sections
  "featuredProductIds": ["pick 2-4 ids from the catalog provided"],
  "faq": [{"q":"...","a":"..."}]  // 3 practical questions
}
Rules: helpful and honest, NOT salesy. Never make medical claims (say "may help",
not "cures"). For persistent/severe issues, advise seeing a dermatologist. Only use
product ids from the catalog list. Mirror the searcher's real language in the title.`;

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Set ANTHROPIC_API_KEY (it's in ../the-listener/.env).");
    process.exit(1);
  }
  const briefPath = path.resolve(BRIEF);
  if (!fs.existsSync(briefPath)) {
    console.error(`Brief not found: ${briefPath}. Run the listener bridge first.`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf-8"));
  const client = new Anthropic();
  const catalogText = CATALOG.map((c) => `- ${c.id}: ${c.label}`).join("\n");

  let made = 0;
  for (const item of brief.content_briefs || []) {
    if (made >= LIMIT) break;
    const slug = slugify(item.pain || "");
    if (!slug) continue;
    const out = path.join(OUT_DIR, `${slug}.json`);
    if (fs.existsSync(out)) {
      console.log(`skip (exists): ${slug}`);
      continue;
    }

    const prompt = `A real person posted this skincare need:\n"${item.pain}"\n` +
      `Detected angle: ${item.angle || "n/a"}\n\n` +
      `Write a guide that genuinely answers it.\n\nProduct catalog (use only these ids):\n${catalogText}\n\n${SCHEMA}`;

    try {
      const resp = await client.messages.create({
        model: MODEL,
        max_tokens: 1600,
        messages: [{ role: "user", content: prompt }],
      });
      const text = resp.content[0].text.trim();
      const start = text.indexOf("{");
      const guide = JSON.parse(text.slice(start));
      guide.slug = slug;
      guide.updated = new Date().toISOString().slice(0, 10);
      // keep only valid product ids
      const valid = new Set(CATALOG.map((c) => c.id));
      guide.featuredProductIds = (guide.featuredProductIds || []).filter((id) => valid.has(id));
      fs.writeFileSync(out, JSON.stringify(guide, null, 2));
      console.log(`wrote: ${slug}`);
      made++;
    } catch (e) {
      console.error(`failed: ${slug} — ${e.message}`);
    }
  }
  console.log(`\nDone. ${made} new guide(s) generated.`);
}

main();
