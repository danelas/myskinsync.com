import type { PriceInfo } from "@/lib/price";

/** Compliant live-price display: shows the price + the date it was fetched
 * ("as of …"), per Amazon's requirement when displaying prices. */
export function PriceTag({ info, className = "" }: { info?: PriceInfo; className?: string }) {
  if (!info?.price) return null;
  const asOf = new Date(info.fetchedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span className="font-semibold text-ink">{info.price}</span>
      <span className="text-xs text-ink/45">on Amazon · as of {asOf}</span>
    </span>
  );
}
