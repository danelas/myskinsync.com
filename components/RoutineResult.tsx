"use client";

import { useEffect, useState } from "react";
import type { Answers, Routine, RoutineStep } from "@/lib/types";
import type { PriceInfo } from "@/lib/price";
import { affiliateUrl, AFFILIATE_LINK_PROPS } from "@/lib/affiliate";
import { AffiliateDisclosure } from "./Disclosure";
import { ProductThumb } from "./ProductThumb";
import { PriceTag } from "./PriceTag";

function StepCard({ s, index, price }: { s: RoutineStep; index: number; price?: PriceInfo }) {
  const p = s.product;
  return (
    <li className="rounded-2xl bg-white border border-ink/10 p-5 shadow-soft flex gap-4">
      <div className="h-8 w-8 shrink-0 rounded-full bg-sage/30 text-ink font-semibold flex items-center justify-center text-sm">
        {index + 1}
      </div>
      <ProductThumb brand={p.brand} image={p.image} size="h-14 w-14" />
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wide text-clay">
            {s.label}
          </span>
          {s.frequency && (
            <span className="text-xs text-ink/50">· {s.frequency}</span>
          )}
        </div>
        <h4 className="mt-1 font-semibold leading-tight font-sans">
          {p.brand} {p.name}
        </h4>
        <p className="mt-1 text-sm text-ink/70">{p.blurb}</p>
        {price?.price && <PriceTag info={price} className="mt-2 block" />}
        <a
          href={affiliateUrl(p)}
          {...AFFILIATE_LINK_PROPS}
          className="mt-3 inline-block text-sm font-semibold rounded-full bg-ink text-cream px-4 py-2 shadow-soft hover:bg-clay hover:-translate-y-0.5 transition-all"
        >
          {price?.price ? "Buy on Amazon →" : "Shop on Amazon →"}
        </a>
      </div>
    </li>
  );
}

/** Fetch live prices for any products in the routine that have a real ASIN. */
function usePrices(routine: Routine): Record<string, PriceInfo> {
  const [prices, setPrices] = useState<Record<string, PriceInfo>>({});
  useEffect(() => {
    const asins = [...new Set(
      [...routine.am, ...routine.pm, ...routine.weekly]
        .map((s) => s.product.asin)
        .filter((a): a is string => Boolean(a))
    )];
    if (asins.length === 0) return;
    fetch(`/api/prices?asins=${asins.join(",")}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then(setPrices)
      .catch(() => {});
  }, [routine]);
  return prices;
}

export function RoutineResult({
  routine,
  answers,
  onRestart,
}: {
  routine: Routine;
  answers: Answers;
  onRestart: () => void;
}) {
  const prices = usePrices(routine);
  return (
    <div className="space-y-10">
      <div className="text-center">
        <p className="text-sm font-medium text-clay uppercase tracking-wider">
          Your personalized routine
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Built for {answers.skinType} skin
        </h2>
        <p className="mt-3 text-ink/70">
          Here&apos;s your morning and night lineup, in the order to apply it.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h3 className="font-semibold text-lg mb-3">☀️ Morning</h3>
          <ol className="space-y-3">
            {routine.am.map((s, i) => (
              <StepCard key={`am-${i}`} s={s} index={i} price={s.product.asin ? prices[s.product.asin] : undefined} />
            ))}
          </ol>
        </section>
        <section>
          <h3 className="font-semibold text-lg mb-3">🌙 Night</h3>
          <ol className="space-y-3">
            {routine.pm.map((s, i) => (
              <StepCard key={`pm-${i}`} s={s} index={i} price={s.product.asin ? prices[s.product.asin] : undefined} />
            ))}
          </ol>
        </section>
      </div>

      {routine.weekly.length > 0 && (
        <section>
          <h3 className="font-semibold text-lg mb-3">✨ A few times a week</h3>
          <ol className="space-y-3 max-w-xl">
            {routine.weekly.map((s, i) => (
              <StepCard key={`wk-${i}`} s={s} index={i} price={s.product.asin ? prices[s.product.asin] : undefined} />
            ))}
          </ol>
        </section>
      )}

      <div className="rounded-2xl bg-white/70 border border-ink/10 p-6 space-y-4">
        <p className="text-sm text-ink/70">
          <strong>Tip:</strong> introduce one new active at a time and always
          patch-test. Give a routine 4–6 weeks before judging results.
        </p>
        <AffiliateDisclosure />
      </div>

      <div className="text-center">
        <button
          onClick={onRestart}
          className="rounded-full border border-ink px-6 py-3 font-medium hover:bg-ink hover:text-cream transition-colors"
        >
          ↻ Retake the quiz
        </button>
      </div>
    </div>
  );
}
