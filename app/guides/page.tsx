import type { Metadata } from "next";
import Link from "next/link";
import { getAllGuides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Skincare Guides",
  description:
    "Honest, practical skincare guides built from the questions real people ask — what to buy for your skin type, concern, and budget.",
};

export default function GuidesIndex() {
  const guides = getAllGuides();
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Skincare guides
        </h1>
        <p className="mt-3 text-ink/70 max-w-2xl mx-auto">
          Straight answers to the questions people actually ask — no fluff, no
          12-step routines. Each guide ends with a routine you can shop in one trip.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-5">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="rounded-2xl bg-white border border-ink/10 p-6 hover:border-clay transition-colors block"
          >
            <h2 className="font-semibold text-lg leading-snug">{g.title}</h2>
            <p className="mt-2 text-sm text-ink/70">{g.description}</p>
            <span className="mt-3 inline-block text-sm font-medium text-clay">
              Read guide →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/quiz"
          className="inline-block rounded-full bg-ink text-cream font-medium px-7 py-3 hover:bg-clay transition-colors"
        >
          Or build your routine in 60 seconds →
        </Link>
      </div>
    </div>
  );
}
