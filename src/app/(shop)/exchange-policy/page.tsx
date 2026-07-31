import type { Metadata } from "next";
import { RefreshCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Exchange & Credit Note Policy | Little Bunnies Baby Products",
  description:
    "Read Little Bunnies' exchange & credit note policy for baby products. Learn about product exchanges, credit notes, and eligibility criteria.",
  alternates: {
    canonical: "https://littlebunnies.co.in/exchange-policy",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cream-dark via-cream to-sky-brand py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <RefreshCcw size={14} className="text-ink-muted" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">Legal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-semibold text-ink mb-4">
            Exchange &amp; Credit Note Policy
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Read Little Bunnies' Exchange & Credit Note Policy
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-container py-10 pb-20">
        <div className="max-w-3xl mx-auto bg-white rounded-brand shadow-card p-8 md:p-12">
          <div className="policy-prose">
            <h2>{`15-DAY EXCHANGE`}</h2>
            <p>{`We want you to be happy with your purchase. However, if you need to exchange a product, we offer a simple and transparent Exchange & Credit Note Policy, instead of refunds or returns.`}</p>
            
            <h3>{`Terms for Exchange:`}</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>{`Orders are eligible for exchange within 15 days of delivery. Requests after this period will not be accepted.`}</li>
              <li>{`Once a product has been exchanged, it is not eligible for a second exchange.`}</li>
              <li>{`Please ensure you record an unboxing video at the time of opening the package, especially if there are any packaging defects. This helps us verify and process your request quickly.`}</li>
              <li>{`Products must be returned in unused, unwashed condition with all original tags and packaging intact.`}</li>
              <li>{`Items showing signs of wear, washing, or damage will not qualify for exchange or store credit.`}</li>
              <li>{`Flash Sale or Clearance Sale items are not eligible for exchange or refund.`}</li>
              <li>{`If the replacement product costs more, you will need to pay the difference. If it costs less, the balance will be credited to you as a Credit Note.`}</li>
            </ul>

            <h3>{`Store Credit (Credit Note)`}</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>{`We do not offer monetary refunds. Instead, we issue a credit note equivalent to the value of your original order.`}</li>
              <li>{`This credit can be used to shop any item from our website and will be valid for 30 days from the date of issue.`}</li>
              <li>{`Store credit will be processed within 4-5 working days after the product reaches our warehouse and passes a quality check.`}</li>
              <li>{`The credit will be automatically added to your account and can be applied during checkout.`}</li>
            </ul>

            <h3>{`Reverse Pickup & Shipping`}</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>{`Reverse pickups are available at an additional cost of ₹200, charged by our logistics partner. This is a mandatory logistics fee and must be paid by the customer to initiate the exchange process.`}</li>
              <li>{`The pickup may take up to 3-4 working days to complete.`}</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
