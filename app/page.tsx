import Link from "next/link";
import { getAllGuides } from "@/lib/guides";

export default function Home() {
  const guides = getAllGuides().slice(0, 3);
  return (
    <div className="mx-auto max-w-5xl px-5">
      {/* Hero — speaks the exact pain point from the Listener data */}
      <section className="py-20 sm:py-28 text-center">
        <p className="text-sm font-medium text-clay uppercase tracking-wider">
          Free · 60 seconds · no email required
        </p>
        <h1 className="mt-4 text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
          “I have no idea what
          <br className="hidden sm:block" /> products I need for my skin.”
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-ink/70 max-w-2xl mx-auto">
          You&apos;re not alone — it&apos;s the #1 thing people ask online. Answer
          4 quick questions and get a personalized AM/PM routine, with the exact
          products in the exact order to use them.
        </p>
        <div className="mt-9">
          <Link
            href="/quiz"
            className="inline-block rounded-full bg-ink text-cream text-base font-medium px-8 py-4 hover:bg-clay transition-colors"
          >
            Build my routine →
          </Link>
        </div>
        <p className="mt-4 text-sm text-ink/50">
          Matched from real dermatologist-loved products. No fluff, no 12-step nonsense.
        </p>
      </section>

      {/* How it works */}
      <section className="py-12 grid sm:grid-cols-3 gap-6">
        {[
          {
            n: "1",
            t: "Tell us your skin",
            d: "Skin type, your main goal, sensitivity, and budget. Four taps.",
          },
          {
            n: "2",
            t: "Get your routine",
            d: "A clear morning + night lineup — cleanser, treatment, moisturizer, SPF — sequenced for you.",
          },
          {
            n: "3",
            t: "Shop it in one place",
            d: "Every product linked, so you can grab the whole routine in a single trip.",
          },
        ].map((s) => (
          <div key={s.n} className="rounded-2xl bg-white/60 border border-ink/10 p-6">
            <div className="h-9 w-9 rounded-full bg-blush text-ink font-semibold flex items-center justify-center">
              {s.n}
            </div>
            <h3 className="mt-4 font-semibold text-lg">{s.t}</h3>
            <p className="mt-2 text-ink/70 text-sm leading-relaxed">{s.d}</p>
          </div>
        ))}
      </section>

      {/* Popular guides — internal links + SEO entry points */}
      {guides.length > 0 && (
        <section className="py-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Popular guides
            </h2>
            <Link href="/guides" className="text-sm font-medium text-clay hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="rounded-2xl bg-white/60 border border-ink/10 p-6 hover:border-clay transition-colors block"
              >
                <h3 className="font-semibold leading-snug">{g.title}</h3>
                <span className="mt-3 inline-block text-sm font-medium text-clay">
                  Read guide →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reassurance */}
      <section className="py-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Skincare shouldn&apos;t be a guessing game
        </h2>
        <p className="mt-4 text-ink/70 max-w-2xl mx-auto">
          We cut through the noise of thousands of products and conflicting advice,
          and match you with what actually fits your skin — including gentle-only
          picks if you react easily.
        </p>
        <div className="mt-8">
          <Link
            href="/quiz"
            className="inline-block rounded-full border border-ink px-7 py-3 font-medium hover:bg-ink hover:text-cream transition-colors"
          >
            Start the free quiz
          </Link>
        </div>
      </section>
    </div>
  );
}
