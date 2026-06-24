import type { Metadata } from "next";
import Link from "next/link";
import { Package, Clock, MapPin, AlertCircle, Truck, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Learn about Little Bunnies shipping policy — free shipping above ₹599, 15-day delivery window, and COD availability across India.",
};

const sections = [
  {
    icon: Clock,
    title: "Delivery Timeline",
    color: "bg-peach-light text-peach-dark",
    content: [
      "Standard delivery: 7–15 business days from the date of order confirmation.",
      "Express delivery (where available): 3–5 business days.",
      "Orders placed before 12:00 PM IST are processed the same business day; orders after 12:00 PM are processed the next business day.",
      "Saturdays, Sundays, and national holidays are not counted as business days.",
    ],
  },
  {
    icon: Truck,
    title: "Shipping Charges",
    color: "bg-sage-light text-sage-dark",
    content: [
      "Free shipping on all orders above ₹599.",
      "Orders below ₹599 attract a flat shipping fee of ₹79.",
      "Cash on Delivery (COD) is available across all serviceable pin codes with an additional COD handling fee of ₹29.",
      "Shipping charges are non-refundable unless the error is on our part.",
    ],
  },
  {
    icon: MapPin,
    title: "Serviceable Areas",
    color: "bg-sky-brand text-ink-light",
    content: [
      "We ship across India to 27,000+ pin codes through our trusted logistics partners.",
      "Remote or difficult-to-access areas may experience additional 3–5 days of delay.",
      "If your pin code is not serviceable, you will be notified at checkout.",
      "International shipping is not available at this time.",
    ],
  },
  {
    icon: Package,
    title: "Packaging",
    color: "bg-lavender-brand-light text-lavender-brand-dark",
    content: [
      "All products are packed with premium baby-safe packaging materials.",
      "Fragile items are bubble-wrapped and secured with additional padding.",
      "Each package includes an invoice and a Little Bunnies care card.",
      "We use eco-friendly packaging wherever possible.",
    ],
  },
  {
    icon: AlertCircle,
    title: "Order Tracking",
    color: "bg-blush-light text-blush-dark",
    content: [
      "A tracking number will be emailed and sent via WhatsApp within 24 hours of shipment.",
      "Use the tracking link to monitor your order in real time.",
      "If your tracking information has not updated for more than 48 hours, please contact us.",
      "For COD orders, our support team will call to confirm delivery before dispatch.",
    ],
  },
  {
    icon: CheckCircle,
    title: "Damaged or Missing Items",
    color: "bg-peach-light text-peach-dark",
    content: [
      "Inspect your package immediately upon delivery.",
      "Report damaged, defective, or missing items within 48 hours of delivery.",
      "Take photographs of the damaged product and packaging and share them with our support team.",
      "We will arrange for a replacement or refund within 5–7 business days of verification.",
    ],
  },
];

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-peach-light via-cream to-sky-brand py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <Truck size={14} className="text-peach-dark" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">Shipping Info</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-4">
            Shipping Policy
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            We ship your little one&apos;s essentials safely and swiftly — within <strong className="text-ink">15 business days</strong> across all of India.
          </p>
        </div>
      </section>

      {/* 15-Day Highlight */}
      <section className="section-container py-10">
        <div className="bg-ink rounded-brand p-6 md:p-10 text-center text-cream">
          <div className="text-6xl md:text-8xl font-display font-bold text-peach mb-2">15</div>
          <div className="text-xl md:text-2xl font-semibold mb-3">Day Maximum Delivery</div>
          <p className="text-cream/70 max-w-xl mx-auto text-sm md:text-base">
            Every order placed on Little Bunnies is guaranteed to arrive within 15 business days. Most orders are delivered in 7–10 days.
          </p>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="section-container py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map(({ icon: Icon, title, color, content }) => (
            <div key={title} className="bg-white rounded-brand shadow-card p-6 md:p-8">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-pill ${color} mb-4 text-sm font-bold`}>
                <Icon size={16} />
                {title}
              </div>
              <ul className="space-y-3">
                {content.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-ink-light leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-peach mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-container pb-16 md:pb-24 text-center">
        <p className="text-ink-muted mb-6 font-medium">
          Have questions about your shipment?
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/contact" className="btn-primary">
            Contact Support
          </Link>
          <Link href="/faq" className="btn-secondary">
            Read FAQ
          </Link>
        </div>
      </section>
    </main>
  );
}
