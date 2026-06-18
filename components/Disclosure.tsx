/**
 * Required disclosures. Amazon's Operating Agreement requires the Associate
 * statement; the FTC requires clear affiliate disclosure near the links.
 * Keep these visible — removing them risks the Associates account.
 */
export function AffiliateDisclosure({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-ink/60">
        We may earn a commission from links on this page, at no extra cost to you.
      </p>
    );
  }
  return (
    <div className="text-xs leading-relaxed text-ink/60">
      <p>
        <strong>As an Amazon Associate we earn from qualifying purchases.</strong>{" "}
        MySkinSync recommends products through affiliate links — if you buy through
        them we may earn a small commission, at no extra cost to you. This never
        affects which products we suggest.
      </p>
      <p className="mt-2">
        This site is for general informational purposes and is not medical advice.
        For persistent acne, reactions, or any skin condition, see a board-certified
        dermatologist.
      </p>
    </div>
  );
}
