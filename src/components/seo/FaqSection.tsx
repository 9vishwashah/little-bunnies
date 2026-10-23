import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import type { Faq } from "@/lib/seoContent";

interface FaqSectionProps {
  title: string;
  subtitle?: string;
  faqs: Faq[];
  id?: string;
  /** Optional call-to-action button shown under the questions. */
  cta?: { label: string; href: string };
}

/**
 * Visible FAQ accordion built on native <details>/<summary>: works without
 * JavaScript, is fully readable by crawlers, and — unlike the previous
 * visually-hidden (sr-only) FAQ blocks — shows exactly the same text as the
 * FAQPage JSON-LD emitted alongside it, as Google's structured-data
 * guidelines require.
 */
export default function FaqSection({ title, subtitle, faqs, id = "faq", cta }: FaqSectionProps) {
  return (
    <section id={id} className="py-12 md:py-20 bg-cream">
      <div className="section-container max-w-3xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-3">{title}</h2>
          {subtitle && <p className="text-ink-light text-sm md:text-base">{subtitle}</p>}
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group bg-white rounded-2xl border border-ink/5 shadow-sm open:shadow-soft transition-shadow"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 md:p-6 font-display font-bold text-base md:text-lg text-ink hover:text-peach-dark transition-colors [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <ChevronDown
                  size={20}
                  className="flex-shrink-0 text-ink-light transition-transform duration-300 group-open:rotate-180 group-open:text-peach-dark"
                />
              </summary>
              <div className="px-5 pb-5 md:px-6 md:pb-6 text-ink-light text-sm md:text-base leading-relaxed border-t border-ink/5 pt-4">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        {cta && (
          <div className="mt-8 md:mt-10 text-center">
            <Link
              href={cta.href}
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold shadow-soft-lg hover:shadow-soft-xl transition-all"
            >
              <span>{cta.label}</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
