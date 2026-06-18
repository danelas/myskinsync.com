import type { Answers, Product, Routine, RoutineStep, Phase } from "./types";
import { PRODUCTS } from "./products";

const BUDGET_RANK: Record<string, number> = { budget: 0, mid: 1, premium: 2 };

/** Score how well a product fits the user's answers. Higher = better match. */
function score(p: Product, a: Answers): number {
  let s = 0;

  // Skin-type fit
  if (p.skinTypes.includes("all")) s += 2;
  if (p.skinTypes.includes(a.skinType)) s += 4;

  // Concern fit (the biggest lever)
  if (p.concerns.includes(a.concern)) s += 6;

  // Sensitivity: hard-prefer gentle products for reactive skin
  if (a.sensitive === "yes") s += p.sensitiveSafe ? 3 : -8;

  // Budget: reward a match, lightly penalize going over the user's tier
  const diff = BUDGET_RANK[p.budget] - BUDGET_RANK[a.budget];
  if (diff === 0) s += 3;
  else if (diff > 0) s -= 2 * diff;
  else s += 1;

  // Tie-breaker: real-world demand from The Listener
  s += p.popularity / 100;
  return s;
}

function pick(step: string, a: Answers, phase?: Phase): Product | null {
  const candidates = PRODUCTS.filter((p) => {
    if (p.step !== step) return false;
    if (phase && p.phase && p.phase !== "both" && p.phase !== phase) return false;
    return true;
  });
  if (candidates.length === 0) return null;
  return candidates
    .map((p) => ({ p, s: score(p, a) }))
    .sort((x, y) => y.s - x.s)[0].p;
}

function reason(a: Answers): string {
  const goal: Record<string, string> = {
    acne: "clear breakouts",
    dryness: "lock in hydration",
    redness: "calm and protect",
    darkspots: "fade marks",
    texture: "smooth texture",
    aging: "soften fine lines",
  };
  return `Chosen for ${a.skinType} skin to ${goal[a.concern]}${
    a.sensitive === "yes" ? ", kept gentle for reactive skin" : ""
  }.`;
}

export function buildRoutine(a: Answers): Routine {
  const why = reason(a);

  const cleanser = pick("cleanser", a)!;
  const moisturizer = pick("moisturizer", a)!;
  const spf = pick("spf", a)!;
  const amSerum = pick("treatment", a, "am");
  const pmTreatment = pick("treatment", a, "pm");

  const step = (label: string, product: Product | null, frequency?: string): RoutineStep | null =>
    product ? { label, product, why, frequency } : null;

  const am = [
    step("Cleanse", cleanser),
    step("Treat", amSerum),
    step("Moisturize", moisturizer),
    step("Protect", spf, "Every morning, reapply midday"),
  ].filter(Boolean) as RoutineStep[];

  const pm = [
    step("Cleanse", cleanser),
    step("Treat", pmTreatment, "Start every other night"),
    step("Moisturize", moisturizer),
  ].filter(Boolean) as RoutineStep[];

  // Weekly exfoliation — only for non-reactive skin with texture/acne goals.
  const wantsExfoliant =
    a.sensitive === "no" && (a.concern === "texture" || a.concern === "acne");
  const exfoliant = wantsExfoliant ? pick("exfoliant", a) : null;
  const weekly = [step("Exfoliate", exfoliant, "2–3x per week, PM")].filter(
    Boolean
  ) as RoutineStep[];

  return { am, pm, weekly };
}
