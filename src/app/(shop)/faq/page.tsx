"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, Package, CreditCard, Truck, RefreshCw, Baby, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    category: "Orders & Shipping",
    icon: Truck,
    color: "text-peach-dark",
    items: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 7–15 business days. Most orders arrive within 7–10 days. We process orders placed before 12 PM IST on the same business day.",
      },
      {
        q: "Is there free shipping?",
        a: "Yes! We offer free shipping on all orders above ₹5999. Orders below ₹5999 have a flat shipping fee of ₹79.",
      },

      {
        q: "How do I track my order?",
        a: "You will receive a tracking number via email and WhatsApp within 24 hours of your order being dispatched. Use the link to track your shipment in real time.",
      },
      {
        q: "Can I change my delivery address after placing an order?",
        a: "Address changes can only be made within 2 hours of placing the order. Contact us immediately via WhatsApp at +91 97252 52421.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    icon: RefreshCw,
    color: "text-blush-dark",
    items: [
      {
        q: "What is the return window?",
        a: "You have 15 days from the date of delivery to initiate a return for eligible products.",
      },
      {
        q: "How do I initiate a return?",
        a: "Contact us via WhatsApp (+91 97252 52421) or email with your order number, reason for return, and photos of the product within 15 days of delivery.",
      },
      {
        q: "When will I receive my refund?",
        a: "Refunds are processed within 5–7 business days after successful quality check at our warehouse. UPI/Net Banking refunds take 3–5 days; card refunds take 5–7 days.",
      },
      {
        q: "Are hygiene products returnable?",
        a: "No. Hygiene products like diapers and wipes that have been opened cannot be returned for health and safety reasons.",
      },
    ],
  },
  {
    category: "Products",
    icon: Baby,
    color: "text-sage-dark",
    items: [
      {
        q: "Are your products safe for newborns?",
        a: "Absolutely! All Little Bunnies products are curated specifically for babies aged 0–6 months and comply with applicable Indian safety standards.",
      },
      {
        q: "Are the product images accurate?",
        a: "We strive to show the most accurate product images. Slight color variations may occur due to screen calibration differences.",
      },
      {
        q: "Do you offer gift wrapping?",
        a: "Gift wrapping is available for select products. You can add a gift message at checkout. A small gift-wrap fee applies.",
      },
      {
        q: "Are your prams easy to assemble?",
        a: "Yes! All our prams come with detailed assembly guides and video tutorial links. Most can be assembled in under 10 minutes.",
      },
    ],
  },
  {
    category: "Payments",
    icon: CreditCard,
    color: "text-lavender-brand-dark",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking, and wallets (Paytm, PhonePe, Google Pay).",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. All transactions are encrypted using industry-standard SSL technology. We do not store your card details.",
      },
      {
        q: "Can I use multiple discount codes?",
        a: "Only one discount code can be applied per order. Codes cannot be combined unless explicitly stated in the offer.",
      },
      {
        q: "My payment failed but money was deducted — what do I do?",
        a: "If your payment failed but the amount was debited, it will be automatically refunded to your account within 5–7 business days. Contact us if it doesn't appear.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border border-cream-darker rounded-brand overflow-hidden transition-all", open && "shadow-soft")}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-cream/50 transition-colors"
      >
        <span className="text-sm font-semibold text-ink leading-snug">{q}</span>
        <ChevronDown
          size={18}
          className={cn("flex-shrink-0 text-ink-muted transition-transform duration-300", open && "rotate-180")}
        />
      </button>
      <div className={cn("overflow-hidden transition-all duration-300", open ? "max-h-60" : "max-h-0")}>
        <div className="px-5 pb-4 pt-1 text-sm text-ink-muted leading-relaxed bg-white border-t border-cream-dark">
          {a}
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-brand via-cream to-sage-light py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <HelpCircle size={14} className="text-sage-dark" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">Help Centre</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Everything you need to know about shopping at Little Bunnies.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="section-container py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          {faqs.map(({ category, icon: Icon, color, items }) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-white shadow-soft-sm">
                  <Icon size={20} className={color} />
                </div>
                <h2 className="text-xl md:text-2xl font-display font-bold text-ink">{category}</h2>
              </div>
              <div className="space-y-3">
                {items.map(({ q, a }) => (
                  <FAQItem key={q} q={q} a={a} />
                ))}
              </div>
            </div>
          ))}
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
            Our support team is available Mon–Sat, 10 AM–6 PM IST to help you with anything.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="btn-primary bg-white text-ink hover:bg-cream">
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
