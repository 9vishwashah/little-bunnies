import type { Metadata } from "next";
import { Scale } from "lucide-react";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's title template (see about/page.tsx).
  title: { absolute: "Terms & Conditions | Little Bunnies — Baby Products India" },
  description:
    "Little Bunnies terms & conditions: the rules for using our website, placing orders, payments and pricing, plus your rights and responsibilities as a customer.",
  alternates: {
    canonical: "https://littlebunnies.co.in/terms",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cream-dark via-cream to-sky-brand py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <Scale size={14} className="text-ink-muted" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">Legal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-semibold text-ink mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            The rules governing your use of the Little Bunnies website and your orders with us.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-container py-10 pb-20">
        <div className="max-w-3xl mx-auto bg-white rounded-brand shadow-card p-8 md:p-12">
          <div className="policy-prose">
            <p>
              These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the Little Bunnies
              website (littlebunnies.co.in) and any purchase you make through it. By browsing our site or
              placing an order, you agree to these Terms. If you do not agree, please do not use the website.
            </p>

            <h3>Eligibility</h3>
            <p>
              You must be at least 18 years old, or be using the site under the supervision of a parent or
              guardian, to place an order with us. By placing an order, you confirm that the information you
              provide is accurate and that you are authorized to use the payment method provided.
            </p>

            <h3>Products &amp; Pricing</h3>
            <p>
              We make every effort to display our products and their prices accurately. However, colours,
              packaging, and minor specifications may vary slightly from what is shown due to photography,
              screen settings, or manufacturing updates. All prices are listed in Indian Rupees (₹) and are
              inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices,
              correct pricing errors, or discontinue any product at any time without prior notice.
            </p>

            <h3>Orders &amp; Payment</h3>
            <p>
              Placing an order on our website constitutes an offer to purchase, which we may accept or decline
              at our discretion — for example, in cases of stock unavailability, pricing errors, or suspected
              fraudulent activity. Payment is processed at checkout via our supported payment methods. Your
              order is confirmed once payment is verified and you receive an order confirmation.
            </p>

            <h3>Shipping &amp; Returns</h3>
            <p>
              Delivery timelines and charges are outlined in our{" "}
              <a href="/shipping-policy">Shipping Policy</a>. Returns, refunds, and exchanges are governed by
              our <a href="/returns">Return &amp; Refund Policy</a> and{" "}
              <a href="/exchange-policy">Exchange &amp; Credit Note Policy</a>, which form part of these Terms.
            </p>

            <h3>Intellectual Property</h3>
            <p>
              All content on this website — including text, graphics, logos, product images, and design — is
              the property of Little Bunnies or its licensors and is protected by applicable intellectual
              property laws. You may not reproduce, distribute, or otherwise use this content without our
              prior written permission.
            </p>

            <h3>Acceptable Use</h3>
            <p>
              You agree not to misuse the website — including attempting unauthorized access to our systems,
              submitting false or fraudulent orders, or using the site in any way that could damage, disable,
              or impair its operation.
            </p>

            <h3>Limitation of Liability</h3>
            <p>
              Little Bunnies is not liable for any indirect, incidental, or consequential damages arising from
              your use of the website or products purchased through it, to the fullest extent permitted by
              law. Our total liability in connection with any order is limited to the amount you paid for that
              order.
            </p>

            <h3>Governing Law</h3>
            <p>
              These Terms are governed by the laws of India, and any disputes arising from them will be
              subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
            </p>

            <h3>Changes to These Terms</h3>
            <p>
              We may update these Terms from time to time to reflect changes in our practices or for legal
              reasons. The updated version will be posted on this page with a revised effective date. Continued
              use of the website after changes are posted constitutes acceptance of the updated Terms.
            </p>

            <h3>Contact Us</h3>
            <p>
              Questions about these Terms can be sent to{" "}
              <a href="mailto:support@littlebunnies.co.in">support@littlebunnies.co.in</a> or via WhatsApp at{" "}
              <a href="https://wa.me/918976077070" target="_blank" rel="noopener noreferrer">
                +91 89760 77070
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
