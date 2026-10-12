"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  HelpCircle,
  CreditCard,
  Truck,
  RefreshCw,
  Baby,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqCategory } from "@/lib/seoContent";

// The questions and answers themselves live in src/lib/seoContent.ts so this
// accordion and the page's FAQPage JSON-LD are generated from the same data.
// Only the presentation (icon + colour per category) is defined here.
const CATEGORY_STYLE: Record<
  FaqCategory["id"],
  { icon: typeof Truck; color: string }
> = {
  shipping: { icon: Truck, color: "text-peach-dark" },
  exchanges: { icon: RefreshCw, color: "text-blush-dark" },
  products: { icon: Baby, color: "text-sage-dark" },
  payments: { icon: CreditCard, color: "text-lavender-brand-dark" },
};

const HELPFUL_LINKS = [
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/exchange-policy", label: "Exchange & Credit Note Policy" },
  { href: "/exchange-request", label: "Request an Exchange" },
  { href: "/returns", label: "Cancellation & Return Policy" },
  { href: "/prams-strollers", label: "Baby Prams & Strollers" },
  { href: "/diaper-bags", label: "Diaper Bags" },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "border border-cream-darker rounded-brand overflow-hidden transition-all",
        open && "shadow-soft"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-cream/50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-ink leading-snug">{q}</span>
        <ChevronDown
          size={18}
          className={cn(
            "flex-shrink-0 text-ink-muted transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          // Generous ceiling: the longest answers wrap to ~10 lines on a phone.
          open ? "max-h-[32rem]" : "max-h-0"
        )}
      >
        <div className="px-5 pb-4 pt-1 text-sm text-ink-muted leading-relaxed bg-white border-t border-cream-dark">
          {a}
        </div>
      </div>
    </div>
  );
}

export default function FAQClient({ categories }: { categories: FaqCategory[] }) {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-brand via-cream to-sage-light py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <HelpCircle size={14} className="text-sage-dark" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">
              Help Centre
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Everything you need to know about shopping for baby strollers, prams
            and diaper bags at Little Bunnies.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="section-container py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          {categories.map(({ id, title, items }) => {
            const { icon: Icon, color } = CATEGORY_STYLE[id];
            return (
              <div key={id}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-white shadow-soft-sm">
                    <Icon size={20} className={color} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-ink">
                    {title}
                  </h2>
                </div>
                <div className="space-y-3">
                  {items.map(({ question, answer }) => (
                    <FAQItem key={question} q={question} a={answer} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Policies & shop links — also gives the FAQ answers a path to the full policies */}
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-ink mb-4">
              Policies &amp; Helpful Links
            </h2>
            <div className="flex flex-wrap gap-3">
              {HELPFUL_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-2 rounded-pill bg-white shadow-soft-sm text-sm font-semibold text-ink hover:text-peach-dark transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="section-container pb-16 md:pb-24">
        <div className="bg-ink rounded-brand p-8 md:p-12 text-center text-cream max-w-2xl mx-auto">
          <MessageCircle size={40} className="text-peach mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
            Still have questions?
          </h2>
          <p className="text-cream/70 mb-6 text-sm md:text-base">
            Our support team is available Mon–Sat, 10 AM–6 PM IST to help you
            with anything.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="btn-primary bg-white text-ink hover:bg-cream"
            >
              Contact Us
            </Link>
            <Link
              href="https://wa.me/918976077070"
              target="_blank"
              className="btn-whatsapp"
            >
              Chat on WhatsApp
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
