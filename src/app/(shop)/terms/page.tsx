import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Scale, AlertTriangle, ShoppingCart, CreditCard, Shield, Ban } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read Little Bunnies' Terms of Service — the rules and guidelines governing your use of our website and services.",
};

const sections = [
  {
    icon: ShoppingCart,
    title: "Use of Our Website",
    content: [
      "You must be at least 18 years of age to place an order on Little Bunnies.",
      "You agree to provide accurate, current, and complete information when creating an account or placing an order.",
      "You are responsible for maintaining the confidentiality of your account credentials.",
      "You may not use our website for any illegal or unauthorised purpose.",
      "We reserve the right to refuse service, terminate accounts, or cancel orders at our discretion.",
    ],
  },
  {
    icon: CreditCard,
    title: "Orders & Pricing",
    content: [
      "All prices listed on the website are in Indian Rupees (₹) and are inclusive of applicable GST.",
      "We reserve the right to modify prices at any time without prior notice.",
      "An order confirmation email does not guarantee acceptance of your order. We may cancel orders due to stock unavailability or pricing errors.",
      "Little Bunnies shall not be liable for typographical errors in pricing.",
      "Promotional prices and discount codes are valid only for the specified period and conditions.",
    ],
  },
  {
    icon: Shield,
    title: "Intellectual Property",
    content: [
      "All content on this website — including text, images, logos, product descriptions, and design — is the intellectual property of Little Bunnies.",
      "You may not reproduce, distribute, modify, or create derivative works without our prior written consent.",
      "Unauthorised use of our brand name, logo, or content may result in legal action.",
      "User-generated content (e.g., reviews) grants us a non-exclusive, royalty-free licence to use your content on our platforms.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Limitation of Liability",
    content: [
      "Little Bunnies provides its website and products 'as is' without warranties of any kind.",
      "We are not liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products.",
      "Our total liability to you shall not exceed the amount you paid for the product in question.",
      "We are not responsible for delays or failures caused by circumstances beyond our control (e.g., natural disasters, carrier delays).",
    ],
  },
  {
    icon: Ban,
    title: "Prohibited Activities",
    content: [
      "Attempting to gain unauthorised access to our systems or user accounts.",
      "Uploading or transmitting viruses, malware, or harmful code.",
      "Using our website to conduct fraudulent transactions.",
      "Scraping, crawling, or data-mining our website without explicit permission.",
      "Impersonating Little Bunnies or our employees, partners, or other users.",
    ],
  },
  {
    icon: Scale,
    title: "Governing Law & Disputes",
    content: [
      "These Terms are governed by the laws of India.",
      "Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Ahmedabad, Gujarat, India.",
      "We encourage you to contact us first to resolve any dispute amicably before pursuing legal action.",
      "If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cream-dark via-cream to-sky-brand py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <FileText size={14} className="text-ink-muted" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-4">
            Terms of Service
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Please read these terms carefully before using our website or placing an order.
          </p>
          <p className="text-ink-muted/60 text-sm mt-4">Last updated: June 22, 2026</p>
        </div>
      </section>

      {/* Intro */}
      <section className="section-container py-10">
        <div className="max-w-3xl mx-auto bg-white rounded-brand shadow-card p-6 md:p-8">
          <p className="text-ink-light text-sm leading-relaxed">
            Welcome to <strong>Little Bunnies</strong>. By accessing our website (<strong>littlebunnies.co.in</strong>) or making a purchase, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you may not use our services.
          </p>
          <p className="text-ink-light text-sm leading-relaxed mt-3">
            We reserve the right to update these Terms at any time. Continued use of our website after changes constitutes acceptance of the updated Terms.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="section-container pb-10 md:pb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          {sections.map(({ icon: Icon, title, content }) => (
            <div key={title} className="bg-white rounded-brand shadow-card p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-cream-dark flex-shrink-0">
                  <Icon size={20} className="text-ink-muted" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-display font-bold text-ink mb-3">{title}</h2>
                  <ul className="space-y-2.5">
                    {content.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-ink-muted leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-ink-muted mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="section-container pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto bg-ink rounded-brand p-8 text-center text-cream">
          <Scale size={36} className="text-cream/50 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-display font-bold mb-2">Questions About These Terms?</h2>
          <p className="text-cream/70 text-sm mb-5">
            If you have any questions about our Terms of Service, please contact our legal team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="mailto:legal@littlebunnies.co.in" className="btn-primary bg-white text-ink hover:bg-cream">
              legal@littlebunnies.co.in
            </a>
            <Link href="/contact" className="btn-secondary bg-transparent border-cream/30 text-cream/80 hover:bg-cream/10">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
