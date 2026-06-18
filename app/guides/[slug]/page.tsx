import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, getGuideSlugs } from "@/lib/guides";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { AffiliateDisclosure } from "@/components/Disclosure";

export function generateStaticParams() {
  return getGuideSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGuide(params.slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { title: g.title, description: g.description, type: "article" },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = getGuide(params.slug);
  if (!g) notFound();

  const featured = g.featuredProductIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  // SEO: Article + FAQ structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: g.title,
        description: g.description,
        dateModified: g.updated,
        author: { "@type": "Organization", name: "MySkinSync" },
      },
      g.faq.length > 0 && {
        "@type": "FAQPage",
        mainEntity: g.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ].filter(Boolean),
  };

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/guides" className="text-sm text-clay hover:underline">
        ← All guides
      </Link>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
        {g.title}
      </h1>
      <p className="mt-2 text-sm text-ink/50">
        Updated{" "}
        {new Date(g.updated).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {g.painQuote && (
        <p className="mt-6 border-l-4 border-blush pl-4 italic text-ink/70">
          “{g.painQuote}”
        </p>
      )}

      <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink/80">
        {g.intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Top picks up high — this is what readers came for */}
      {featured.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Our top picks</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} rank={i + 1} />
            ))}
          </div>
          <div className="mt-3">
            <AffiliateDisclosure compact />
          </div>
        </section>
      )}

      {g.sections.map((s, i) => (
        <section key={i} className="mt-10">
          <h2 className="text-xl font-semibold mb-3">{s.h2}</h2>
          <div className="space-y-4 leading-relaxed text-ink/80">
            {s.body.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </section>
      ))}

      {/* Quiz CTA */}
      <section className="mt-12 rounded-2xl bg-ink text-cream p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Not sure what fits your skin?
        </h2>
        <p className="mt-2 text-cream/80">
          Take the free 60-second quiz and get a full routine matched to you.
        </p>
        <Link
          href="/quiz"
          className="mt-5 inline-block rounded-full bg-cream text-ink font-medium px-7 py-3 hover:bg-blush transition-colors"
        >
          Build my routine →
        </Link>
      </section>

      {g.faq.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Frequently asked</h2>
          <dl className="space-y-5">
            {g.faq.map((f, i) => (
              <div key={i}>
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-1 text-ink/75 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className="mt-12">
        <AffiliateDisclosure />
      </div>
    </article>
  );
}
