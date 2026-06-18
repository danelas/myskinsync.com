import Link from "next/link";
import { getAllGuides } from "@/lib/guides";
import { PRODUCTS } from "@/lib/products";
import { LogoMark } from "@/components/Logo";
import { ProductThumb } from "@/components/ProductThumb";
import { ClipboardIcon, RoutineIcon, BagIcon } from "@/components/Icons";

const TRUSTED = ["CeraVe", "The Ordinary", "La Roche-Posay", "Paula's Choice", "EltaMD"];

export default function Home() {
  const guides = getAllGuides().slice(0, 3);
  return (
    <div className="mx-auto max-w-5xl px-5">
      {/* Hero */}
      <section className="relative pt-16 sm:pt-24 pb-12 text-center">
        <LogoMark className="pointer-events-none absolute -top-2 right-2 sm:right-10 h-40 w-40 opacity-[0.06] rotate-12" />
        <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-1.5 text-xs font-medium text-ink/70 shadow-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-sage" />
          Free · 60 seconds · no email required
        </span>
        <h1 className="mt-6 font-display text-5xl sm:text-7xl font-semibold leading-[1.02]">
          “I have no idea what
          <br className="hidden sm:block" />{" "}
          products I need
          <br className="hidden sm:block" /> for my <em className="text-clay not-italic italic">skin.</em>”
        </h1>
        <p className="mt-7 text-lg sm:text-xl text-ink/70 max-w-2xl mx-auto leading-relaxed">
          You&apos;re not alone — it&apos;s the #1 thing people ask online. Answer 4
          quick questions and get a personalized AM/PM routine, with the exact
          products in the exact order to use them.
        </p>
        <div className="mt-9">
          <Link
            href="/quiz"
            className="inline-block rounded-full bg-ink text-cream text-base font-semibold px-9 py-4 shadow-lift hover:bg-clay hover:-translate-y-0.5 transition-all"
          >
            Build my routine →
          </Link>
        </div>

        {/* Trusted brands strip */}
        <div className="mt-12">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
            Matched from products people actually love
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-ink/55">
            {TRUSTED.map((b) => (
              <span key={b} className="font-display text-lg sm:text-xl">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 grid sm:grid-cols-3 gap-5">
        {[
          { Icon: ClipboardIcon, t: "Tell us your skin", d: "Skin type, your main goal, sensitivity, and budget. Four taps." },
          { Icon: RoutineIcon, t: "Get your routine", d: "A clear morning + night lineup — cleanser, treatment, moisturizer, SPF — sequenced for you." },
          { Icon: BagIcon, t: "Shop it in one place", d: "Every product linked, so you can grab the whole routine in a single trip." },
        ].map((s, i) => (
          <div
            key={s.t}
            className="rounded-4xl bg-white/80 border border-ink/10 p-7 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blush/40 text-clayDark">
                <s.Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-clay">STEP {i + 1}</span>
            </div>
            <h3 className="mt-4 font-semibold text-xl">{s.t}</h3>
            <p className="mt-2 text-ink/70 leading-relaxed">{s.d}</p>
          </div>
        ))}
      </section>

      {/* Popular guides */}
      {guides.length > 0 && (
        <section className="py-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-3xl sm:text-4xl font-semibold">Popular guides</h2>
            <Link href="/guides" className="text-sm font-medium text-clay hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {guides.map((g) => {
              const lead = PRODUCTS.find((p) => p.id === g.featuredProductIds[0]);
              return (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group rounded-4xl bg-white/80 border border-ink/10 p-7 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all block"
                >
                  <div className="flex items-center gap-3">
                    {lead && <ProductThumb brand={lead.brand} image={lead.image} step={lead.step} size="h-14 w-14" />}
                    {g.concern && (
                      <span className="inline-block rounded-full bg-blush/40 px-3 py-1 text-xs font-medium text-clayDark capitalize">
                        {g.concern}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-semibold text-lg leading-snug">{g.title}</h3>
                  <span className="mt-3 inline-block text-sm font-medium text-clay group-hover:underline">
                    Read guide →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Reassurance */}
      <section className="my-12 rounded-4xl bg-ink text-cream px-8 py-14 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold">
          Skincare shouldn&apos;t be a guessing game
        </h2>
        <p className="mt-4 text-cream/75 max-w-2xl mx-auto leading-relaxed">
          We cut through thousands of products and conflicting advice, and match
          you with what actually fits your skin — including gentle-only picks if you
          react easily.
        </p>
        <div className="mt-8">
          <Link
            href="/quiz"
            className="inline-block rounded-full bg-cream text-ink px-8 py-4 font-semibold shadow-lift hover:bg-blush hover:-translate-y-0.5 transition-all"
          >
            Start the free quiz →
          </Link>
        </div>
      </section>
    </div>
  );
}
