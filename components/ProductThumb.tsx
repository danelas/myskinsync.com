// Branded placeholder tile used where we don't yet have real product photos.
// Shows a product-type icon + brand monogram on a soft gradient — looks
// intentional, not broken. When `image` is set (from the Creators API sync),
// the real photo is shown instead.
import { ProductTypeIcon } from "./Icons";

const TINTS = ["#F4E7DE", "#E6EDE7", "#F1E1DE", "#E3E8EC", "#EFE6D1", "#F0E4EC"];

function initials(brand: string): string {
  const words = brand.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function tintFor(brand: string): string {
  let h = 0;
  for (const c of brand) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
}

export function ProductThumb({
  brand,
  image,
  step = "cleanser",
  size = "h-16 w-16",
}: {
  brand: string;
  image?: string;
  step?: string;
  size?: string;
}) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={image}
        alt={brand}
        className={`${size} shrink-0 rounded-2xl object-cover border border-ink/10 bg-white`}
      />
    );
  }
  return (
    <div
      className={`${size} shrink-0 rounded-2xl border border-ink/10 flex flex-col items-center justify-center gap-0.5`}
      style={{ background: `linear-gradient(135deg, ${tintFor(brand)}, #FBF7F2)` }}
      aria-hidden="true"
    >
      <ProductTypeIcon step={step} className="h-6 w-6 text-ink/45" />
      <span className="font-display font-semibold text-[11px] leading-none text-ink/55">
        {initials(brand)}
      </span>
    </div>
  );
}
