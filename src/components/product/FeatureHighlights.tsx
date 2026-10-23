import {
  Feather,
  RotateCw,
  Sun,
  Minimize2,
  Droplets,
  ShieldCheck,
  Baby,
  Plane,
  Disc3,
  Backpack,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Check } from "lucide-react";
import { parseFeatureItems, nameHighlights } from "@/lib/productFeatures";

/** Up to three short highlights under the product title (instead of the long pipe-separated name). */
export function NameHighlights({ name, className = "" }: { name: string; className?: string }) {
  const items = nameHighlights(name, 3);
  if (items.length === 0) {
    return <p className={`text-sm text-ink-muted leading-relaxed ${className}`}>{name}</p>;
  }
  return (
    <ul className={`space-y-1 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm font-medium text-ink-light leading-snug">
          <Check size={15} className="mt-0.5 flex-shrink-0 text-sage-dark" strokeWidth={2.5} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// Icon per highlight, picked from the wording of its (already written) title.
const ICON_RULES: Array<[RegExp, LucideIcon]> = [
  [/rotat|360|reversible|two[- ]way|swivel/i, RotateCw],
  [/light|weigh|aluminium|aluminum/i, Feather],
  [/fold|compact/i, Minimize2],
  [/canopy|sun|upf|uv/i, Sun],
  [/wheel|steer|suspension/i, Disc3],
  [/water|insulat|wet|bottle/i, Droplets],
  [/safe|harness|brake|lock|anti-theft/i, ShieldCheck],
  [/travel|airplane|cabin|flight/i, Plane],
  [/birth|newborn|toddler|grow|recline|comfort/i, Baby],
  [/bag|pocket|storage|backpack|strap|capacity/i, Backpack],
];

function iconFor(title: string): LucideIcon {
  for (const [re, Icon] of ICON_RULES) if (re.test(title)) return Icon;
  return Sparkles;
}

/**
 * The four headline benefits as short, visually distinct tiles. Cut from the
 * first four items of the product's own feature list; the complete list sits
 * in the "Full features" section below, so nothing is lost.
 */
export default function FeatureHighlights({ html }: { html: string | null | undefined }) {
  const items = parseFeatureItems(html).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5" aria-label="Key benefits">
      {items.map(({ title }) => {
        const Icon = iconFor(title);
        return (
          <li
            key={title}
            className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-3 py-3"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-peach-light/70 text-peach-dark">
              <Icon size={18} strokeWidth={2} />
            </span>
            <span className="text-xs sm:text-sm font-bold leading-snug text-ink">{title}</span>
          </li>
        );
      })}
    </ul>
  );
}
