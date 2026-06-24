import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Little Bunnies hassle-free return and refund policy. Understand our 7-day return window and how to initiate a return.",
};

const eligibleItems = [
  "Products received in damaged or defective condition",
  "Wrong item delivered (different from order)",
  "Items significantly different from the product description",
  "Missing accessories or parts as listed in the product description",
];

const nonEligibleItems = [
  "Products that have been used, washed, or opened (hygiene products)",
  "Items without original packaging or with removed tags",
  "Products damaged due to misuse or improper handling",
  "Customised or personalised orders",
  "Items purchased during clearance/final sale",
  "Perishable goods (wipes, disposable diapers, etc.)",
];

const steps = [
  {
    step: "01",
    title: "Initiate Return Request",
    desc: "Contact us within 7 days of delivery via WhatsApp (+91 97252 52421) or email. Share your order number and reason for return with photos.",
  },
  {
    step: "02",
    title: "Approval & Pickup",
    desc: "Our team will review your request within 24–48 hours. If approved, we'll schedule a free pickup from your registered delivery address.",
  },
  {
    step: "03",
    title: "Quality Check",
    desc: "Once the item is received at our warehouse, it undergoes a quality check within 2–3 business days to verify the return condition.",
  },
  {
    step: "04",
    title: "Refund Processed",
    desc: "Upon successful verification, your refund is initiated within 5–7 business days to your original payment method or as store credit.",
  },
];

const refundTimelines = [
  { method: "UPI / Net Banking", timeline: "3–5 business days" },
  { method: "Credit / Debit Card", timeline: "5–7 business days" },
  { method: "Store Credit (Wallet)", timeline: "Within 24 hours" },
  { method: "Cash on Delivery (COD)", timeline: "Bank transfer in 7–10 days" },
];

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blush-light via-cream to-lavender-brand-light py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <RefreshCw size={14} className="text-blush-dark" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">Easy Returns</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-4">
            Return &amp; Refund Policy
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Your satisfaction is our priority. We offer a <strong className="text-ink">7-day return window</strong> for eligible products — no hassle, no questions.
          </p>
        </div>
      </section>

      {/* Return Window Highlight */}
      <section className="section-container py-10">
        <div className="bg-ink rounded-brand p-6 md:p-10 text-center text-cream">
          <div className="text-6xl md:text-8xl font-display font-bold text-blush mb-2">7</div>
          <div className="text-xl md:text-2xl font-semibold mb-3">Day Return Window</div>
          <p className="text-cream/70 max-w-xl mx-auto text-sm md:text-base">
            You have 7 days from the date of delivery to initiate a return request for eligible items.
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section className="section-container py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eligible */}
          <div className="bg-white rounded-brand shadow-card p-6 md:p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-sage-light text-sage-dark text-sm font-bold mb-5">
              <CheckCircle size={16} />
              Eligible for Return
            </div>
            <ul className="space-y-3">
              {eligibleItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-ink-light leading-relaxed">
                  <CheckCircle size={16} className="text-sage-dark mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Not Eligible */}
          <div className="bg-white rounded-brand shadow-card p-6 md:p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-blush-light text-blush-dark text-sm font-bold mb-5">
              <XCircle size={16} />
              Not Eligible for Return
            </div>
            <ul className="space-y-3">
              {nonEligibleItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-ink-light leading-relaxed">
                  <XCircle size={16} className="text-blush-dark mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Return Steps */}
      <section className="section-container pb-10 md:pb-16">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-ink text-center mb-10">
          How to Return
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="bg-white rounded-brand shadow-card p-6 relative">
              <div className="text-4xl font-display font-bold text-cream-darker mb-3">{step}</div>
              <h3 className="font-bold text-ink mb-2">{title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Refund Timelines */}
      <section className="section-container pb-10 md:pb-16">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-ink text-center mb-8">
          Refund Timelines
        </h2>
        <div className="bg-white rounded-brand shadow-card overflow-hidden max-w-2xl mx-auto">
          <table className="w-full">
            <thead className="bg-cream-dark">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-ink">Payment Method</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-ink">Refund Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-dark">
              {refundTimelines.map(({ method, timeline }) => (
                <tr key={method} className="hover:bg-cream/60 transition-colors">
                  <td className="px-6 py-4 text-sm text-ink-light">{method}</td>
                  <td className="px-6 py-4 text-sm text-ink font-semibold text-right">{timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-ink-muted text-xs mt-4">
          Refunds are processed after successful quality check at our warehouse.
        </p>
      </section>

      {/* CTA */}
      <section className="section-container pb-16 md:pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-blush-light text-blush-dark text-sm font-bold mb-5">
          <AlertTriangle size={14} />
          Need Help?
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-ink mb-4">
          Questions About a Return?
        </h2>
        <p className="text-ink-muted mb-6">Our team is happy to guide you through the process.</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/contact" className="btn-primary">Contact Us</Link>
          <Link href="https://wa.me/919725252421" target="_blank" className="btn-whatsapp">
            WhatsApp Us
          </Link>
        </div>
      </section>
    </main>
  );
}
