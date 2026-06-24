import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Eye, Cookie, Database, Lock, Globe, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read Little Bunnies' Privacy Policy — how we collect, use, and protect your personal information.",
};

const sections = [
  {
    icon: Database,
    title: "Information We Collect",
    content: `We collect information you provide directly to us when you:
• Create an account or place an order (name, email, phone number, delivery address)
• Contact our support team
• Subscribe to our newsletter
• Leave a product review

We also automatically collect certain technical information when you visit our website:
• Device type, browser, and operating system
• Pages visited and time spent on each page
• IP address and approximate location
• Referring URL`,
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    content: `We use the information we collect to:
• Process and fulfil your orders
• Send order confirmations, shipping updates, and delivery notifications
• Respond to customer support queries
• Send promotional emails and WhatsApp messages (with your consent)
• Improve our products, website, and customer experience
• Detect and prevent fraud
• Comply with legal obligations`,
  },
  {
    icon: Globe,
    title: "Sharing of Information",
    content: `We do not sell, rent, or trade your personal information to third parties. We may share your data with:
• Logistics partners (e.g., Delhivery, Shiprocket) to deliver your orders
• Payment processors (e.g., Razorpay) to handle transactions securely
• Analytics providers (e.g., Google Analytics) to understand website usage
• Regulatory authorities when required by law

All third-party partners are contractually bound to use your data only for the specific purpose for which it was shared.`,
  },
  {
    icon: Cookie,
    title: "Cookies & Tracking",
    content: `We use cookies and similar technologies to:
• Keep you signed in across sessions
• Remember your cart and preferences
• Analyse website traffic and performance
• Serve relevant advertisements

You can control cookie settings through your browser preferences. Disabling cookies may affect the functionality of certain features on our website.`,
  },
  {
    icon: Lock,
    title: "Data Security",
    content: `We implement industry-standard security measures to protect your personal information:
• All data transmission is encrypted using SSL/TLS
• Payment information is processed by PCI-DSS compliant processors — we never store your card details
• Our systems are regularly audited for vulnerabilities
• Access to customer data is restricted to authorised personnel only

Despite these measures, no method of internet transmission is 100% secure. We encourage you to use a strong, unique password for your account.`,
  },
  {
    icon: Shield,
    title: "Your Rights",
    content: `Under applicable Indian data protection laws, you have the right to:
• Access the personal information we hold about you
• Correct inaccurate or incomplete information
• Request deletion of your personal data (subject to legal obligations)
• Withdraw consent for marketing communications at any time
• Lodge a complaint with the relevant data protection authority

To exercise any of these rights, contact us at privacy@littlebunnies.co.in.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-lavender-brand-light via-cream to-sky-brand py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <Shield size={14} className="text-lavender-brand-dark" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">Your Privacy Matters</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-4">
            Privacy Policy
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            We are committed to protecting your privacy and handling your personal information with care and transparency.
          </p>
          <p className="text-ink-muted/60 text-sm mt-4">Last updated: June 22, 2026</p>
        </div>
      </section>

      {/* Intro */}
      <section className="section-container py-10">
        <div className="max-w-3xl mx-auto bg-white rounded-brand shadow-card p-6 md:p-8">
          <p className="text-ink-light text-sm leading-relaxed">
            This Privacy Policy explains how <strong>Little Bunnies</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and protects the information you provide when you use our website (<strong>littlebunnies.co.in</strong>) or make a purchase from us. By using our website, you agree to the terms of this Privacy Policy.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="section-container pb-10 md:pb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          {sections.map(({ icon: Icon, title, content }, i) => (
            <div key={title} className="bg-white rounded-brand shadow-card p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-lavender-brand-light flex-shrink-0">
                  <Icon size={20} className="text-lavender-brand-dark" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-display font-bold text-ink mb-3">{title}</h2>
                  <div className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">{content}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="section-container pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto bg-ink rounded-brand p-8 text-center text-cream">
          <Mail size={36} className="text-lavender-brand mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-display font-bold mb-2">Privacy Questions?</h2>
          <p className="text-cream/70 text-sm mb-5">
            If you have any questions about this Privacy Policy or how we handle your data, please reach out to our Data Protection Officer.
          </p>
          <a
            href="mailto:privacy@littlebunnies.co.in"
            className="btn-primary bg-lavender-brand text-ink hover:bg-lavender-brand-dark"
          >
            privacy@littlebunnies.co.in
          </a>
        </div>
      </section>
    </main>
  );
}
