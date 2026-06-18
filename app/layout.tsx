import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AffiliateDisclosure } from "@/components/Disclosure";

const SITE = "MySkinSync";
const TAGLINE = "Find your perfect skincare routine in 60 seconds";

export const metadata: Metadata = {
  metadataBase: new URL("https://myskinsync.com"),
  title: {
    default: `${SITE} — ${TAGLINE}`,
    template: `%s · ${SITE}`,
  },
  description:
    "Confused about what skincare to buy? Take the free 60-second quiz and get a personalized AM/PM routine matched to your skin type and concerns — with the exact products, in the right order.",
  keywords: [
    "skincare routine",
    "skin type quiz",
    "personalized skincare",
    "skincare routine for combination skin",
    "acne-prone skincare routine",
    "what skincare products do I need",
  ],
  openGraph: {
    title: `${SITE} — ${TAGLINE}`,
    description:
      "Take the free quiz and get a personalized skincare routine matched to your skin.",
    url: "https://myskinsync.com",
    siteName: SITE,
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="page-bg min-h-screen flex flex-col antialiased">
        <header className="sticky top-0 z-20 backdrop-blur-md bg-cream/70 border-b border-ink/10">
          <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between">
            <Link href="/" className="font-display font-semibold text-xl tracking-tight">
              My<span className="text-clay">Skin</span>Sync
            </Link>
            <nav className="flex items-center gap-2 sm:gap-4">
              <Link href="/guides" className="text-sm font-medium text-ink/70 hover:text-ink px-2 py-1">
                Guides
              </Link>
              <Link
                href="/quiz"
                className="text-sm font-semibold rounded-full bg-ink text-cream px-5 py-2.5 shadow-soft hover:bg-clay hover:-translate-y-0.5 transition-all"
              >
                Take the quiz
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-ink/10 mt-20 bg-cream/50">
          <div className="mx-auto max-w-5xl px-5 py-12 space-y-6">
            <Link href="/" className="font-display font-semibold text-lg tracking-tight">
              My<span className="text-clay">Skin</span>Sync
            </Link>
            <AffiliateDisclosure />
            <p className="text-xs text-ink/50">
              © {new Date().getFullYear()} {SITE}. All product names are trademarks
              of their respective owners.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
