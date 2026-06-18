import type { Product } from "@/lib/types";
import { affiliateUrl, AFFILIATE_LINK_PROPS } from "@/lib/affiliate";

/** Compact product card used in guides (and reusable elsewhere). */
export function ProductCard({ product, rank }: { product: Product; rank?: number }) {
  return (
    <div className="rounded-2xl bg-white border border-ink/10 p-5">
      <div className="flex items-center gap-2 flex-wrap">
        {rank !== undefined && (
          <span className="h-6 w-6 rounded-full bg-sage/30 text-ink text-xs font-semibold flex items-center justify-center">
            {rank}
          </span>
        )}
        <span className="text-xs font-semibold uppercase tracking-wide text-clay">
          {product.brand}
        </span>
      </div>
      <h4 className="mt-1 font-semibold leading-tight">{product.name}</h4>
      <p className="mt-1 text-sm text-ink/70">{product.blurb}</p>
      <a
        href={affiliateUrl(product)}
        {...AFFILIATE_LINK_PROPS}
        className="mt-3 inline-block text-sm font-medium rounded-full bg-ink text-cream px-4 py-2 hover:bg-clay transition-colors"
      >
        Check price on Amazon →
      </a>
    </div>
  );
}
