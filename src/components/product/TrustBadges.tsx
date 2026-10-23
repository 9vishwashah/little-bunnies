import { Lock, RefreshCw, BadgeCheck } from "lucide-react";

// Warranty terms aren't stated anywhere on the site (policies, FAQ or product
// data), so no warranty badge is shown until the real terms exist. Put the
// short wording here (e.g. "1-Year Warranty") to switch the badge on.
export const WARRANTY_BADGE: string | null = null;

/**
 * Reassurance row under the delivery check. Each badge states something the
 * site already commits to elsewhere: payments are taken on a secure gateway
 * page, and the exchange policy gives 15 days from delivery.
 */
export default function TrustBadges() {
  const badges = [
    { Icon: Lock, title: "Secure Payment", sub: "Safe, encrypted checkout" },
    { Icon: RefreshCw, title: "15-Day Exchange", sub: "From the date of delivery" },
    ...(WARRANTY_BADGE ? [{ Icon: BadgeCheck, title: WARRANTY_BADGE, sub: "On eligible products" }] : []),
  ];

  return (
    <ul className="mb-5 grid gap-2.5 grid-cols-2 sm:grid-cols-3" aria-label="Shopping assurances">
      {badges.map(({ Icon, title, sub }) => (
        <li
          key={title}
          className="flex flex-col items-center gap-1 rounded-xl border border-ink/10 bg-white px-2 py-3 text-center"
        >
          <Icon size={20} className="text-sage-dark" strokeWidth={1.8} />
          <span className="text-xs font-bold text-ink leading-tight">{title}</span>
          <span className="text-[11px] font-medium text-ink-muted leading-tight">{sub}</span>
        </li>
      ))}
    </ul>
  );
}
