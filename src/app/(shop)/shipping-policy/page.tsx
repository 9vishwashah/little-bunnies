import type { Metadata } from "next";
import { Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Read Little Bunnies' Shipping Policy — our guidelines for delivery, shipping methods, and timelines.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cream-dark via-cream to-sky-brand py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <Truck size={14} className="text-ink-muted" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-4">
            Shipping Policy
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Read Little Bunnies' Shipping Policy — our guidelines for delivery, shipping methods, and timelines.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-container py-10 pb-20">
        <div className="max-w-3xl mx-auto bg-white rounded-brand shadow-card p-8 md:p-12">
          <div className="prose prose-stone prose-headings:font-display prose-headings:text-ink prose-p:text-ink-light prose-li:text-ink-light prose-a:text-sage-dark hover:prose-a:text-ink max-w-none">
            
            <p>{`We ship products all over India except some remote areas. Currently, we are not delivering to locations based out of India.`}</p>

            <h3>{`Order Tracking`}</h3>
            <p>{`When you order from us, you will receive a confirmation message or call. Once your order is dispatched, you will be informed through a message or call.`}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Processing Time: (2 Working days):</strong>{` The time it takes to prepare your item(s) & to dispatch them from our warehouse. This includes preparing your items, performing quality checks, and packing for dispatch.`}</li>
              <li><strong>Shipping Time:</strong>{` We ship your order within 3-4 business days of order getting processed, and it will be delivered within 7-10 business days (excluding Sundays and public holidays). In some cases, it may take longer, depending on your location. We aim to speed up our delivery time and enhance your shopping experience with us. Please note that Orders cannot be cancelled once shipped.`}</li>
            </ul>

            <h3>{`Are there any Shipping Charges Applicable on my Order?`}</h3>
            <p>{`Shipping Charges may be applicable on your order, and the exact details will be available during the checkout process. The Shipping Charges vary from product-to-product and may be different for different regions within the country. In case of eligibility for free shipping, no shipping charges will be applicable.`}</p>

            <h3>{`Convenience Charges`}</h3>
            <p>{`A nominal cash handling fee is applicable when you choose the Cash on Delivery (COD) payment option. This fee covers the additional operational and logistics costs involved in processing and managing cash payments at the time of delivery. Please note that the cash-handling fee charged at checkout is non-refundable and will only be refunded in cases where the product is not successfully delivered.`}</p>

            <h3>{`Refund of Shipping Charges`}</h3>
            <p>{`Shipping Charges will not be refunded in case of returning the order. And in case of cancellation, it will be refundable only if the Order is Cancelled before getting Shipped.`}</p>

            <h3>{`Undelivered Goods`}</h3>
            <p>{`If your order does not successfully arrive at the delivery address provided during checkout within the recommended timeframe, please contact us at the number given on the website and let us know.`}</p>
            <p>{`Should your order be marked delivered but you have not received the order, promptly inform us within 48 hours of the delivery status update. We’ll work with you to understand and resolve the situation.`}</p>
            <p>{`Please note that any queries related to undelivered orders beyond 48 hours of marked delivery date will regrettably not be entertained. We appreciate your understanding and cooperation in adhering to this policy.`}</p>

            <h3>{`Opened or Tampered Package`}</h3>
            <p>{`If your package has been opened or tampered with, we request you to not accept the shipment and immediately reach out to us. Kindly note, any intimation after 24 hours of the attempted delivery, will not be considered.`}</p>

          </div>
        </div>
      </section>
    </main>
  );
}
