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
            <h2>{`SHIPPING POLICY`}</h2>
            <p>{`Little Bunnies strives to give its customers high quality products along with smooth & fast, safe & secure online ordering experience. To deliver you the best, we give utmost priority to our logistic management and some of the key features are mentioned below:`}</p>
            <ul className="list-disc pl-5 space-y-2">
            <li>{`FAST, SAFE & RELIABLE SHIPPING PARTNER`}</li>
            </ul>
            <p>{`We at Little Bunnies only trust the best and so we have officially partnered with world’s top logistic partners BLUEDART & DELIVERY, to make sure all your orders are delivered hassle free at your doorstep in shortest time.`}</p>
            <ul className="list-disc pl-5 space-y-2">
            <li>{`STRONG TAMPERPROOF PACKAGING`}</li>
            </ul>
            <p>{`We use high-quality printed recyclable box packaging for most of our standard size shipments. For all other orders, secured tamper & waterproof courier bags or corrugated cartoons are used with complete Little Bunnies tapes securing the parcels from any transit damage or soiling.`}</p>
            <ul className="list-disc pl-5 space-y-2">
            <li>{`FASTEST SHIPMENT & DELIVERY TIME`}</li>
            </ul>
            <p>{`Most of Little Bunnies products are Personalized and thus every piece is unique and it’s always a challenge to process orders in quick time. Therefore, we cover up delivery time and ship all orders through fastest shipping modes based on pin-code. Once shipped, most of the orders are delivered within 24-72 hrs across India . In case the shipment is not received even after 4 days of receiving the shipment alert, please contact our support team for the needful.`}</p>
            <ul className="list-disc pl-5 space-y-2">
            <li>{`SEAMLESS TRACKING & ORDER UPDATES`}</li>
            </ul>
            <p>{`We extremely value your order and therefore throughout your order journey, our team along with highly automated system keeps you connected and updates you at every stage; i.e. order received, processing, completed, shipped with tracking details. All updates are sent via. WhatsApp, E-mails & SMS on registered phone number and email. Further, you can contact our team on working days in business hours (11.00 a.m. -7.00 p.m.) via WhatsApp on support phone numbers.`}</p>
            <ul className="list-disc pl-5 space-y-2">
            <li>{`DELIVERY TIME & LOCATIONS (PREPAID & COD)`}</li>
            </ul>
            <p>{`Most of the products are delivered within standard delivery time (mentioned with each product). We deliver to all serviceable Pin Codes (as per delivery partners) across India. Deliveries to few places like Andaman & Nicobar Islands, Lakshadweep Islands, some North East States, and Jammu & Kashmir etc. may be at our discretion. For over-weight & high volume items, where there are additional charges our team may get in touch to do the needful. Currently we are only shipping within India. However, in case you need to ship outside India , please get in touch with us to arrange that separately at additional charges.`}</p>
            <ul className="list-disc pl-5 space-y-2">
            <li>{`FREE SHIPPING ACROSS INDIA`}</li>
            </ul>
            <p>{`All of Little Bunnies orders [above Rs. 990/-] are shipped free across India . However, from time to time we may charge [peak season/ fuel surcharge amount] to cover up our logistics charges to provide you best of our services.`}</p>
            <ul className="list-disc pl-5 space-y-2">
            <li>{`REVERSE PICK-UP FACILITY`}</li>
            </ul>
            <p>{`In cases where it is required, we also have reverse pick-up facility available wherein the customer needs to just hand over the order back in proper condition without packing to our shipping partner agent. Rest is taken care by us.`}</p>
            <h3>{`SHIPPING RELATED FAQ’S`}</h3>
            <ul className="list-disc pl-5 space-y-2">
            <li>{`Delivery time is the total number of working days for an order to be delivered to your doorsteps from the day it has been ordered.`}</li>
            <li>{`Processing Time is the total number of standard working days required for your ordered to be ready at our manufacturing facility before it is shipped.`}</li>
            <li>{`Shipping Time is the number of working days required for your order to reach you once it is shipped from our facility.`}</li>
            </ul>
            <p>{`DELIVERY TIME = PROCESSING TIME + SHIPPING TIME`}</p>
            <p>{`‣ What does ‘EXPRESS’ tag means on a product ?`}</p>
            <p>{`Express tags (green color) on a product means that the product can be delivered within 5-7 days of ordering. However, in exceptional cases and during seasonal time like festivals, New Year, Christmas etc. , it may take little longer upto 15 days.`}</p>
            <p>{`‣ What does ‘SPEED-UP’ means as mentioned in some products ?`}</p>
            <p>{`**CURRENTLY UNAVAILABLE**`}</p>
            <p>{`Little Bunnies follows a policy of FIFO in processing and shipping its orders. Certain products which are made to order customized products have long standard processing time. However, SPEED-UP is an option where the product processing can be prioritized by paying a little extra and thus reducing delivery time significantly.`}</p>
            <p>{`‣ What is shipping method ‘Quick Ship Via Bluedart Air’?`}</p>
            <p>{`**CURRENTLY UNAVAILABLE**`}</p>
            <p>{`This is a default express mode of shipment for all orders received. No extra charges apply.`}</p>
            <p>{`‣ What is the delivery timeline for orders with multiple products?`}</p>
            <p>{`All the products in a single order are shipped together. Therefore it is important to remember that delivery timeline of the product with highest delivery time will apply to the entire order. In case you need to get some products delivered faster, please mention a note while ordering or get in touch with our customer care team and they will be more than happy to assist.`}</p>
            <p>{`‣ How do I change my shipping address?`}</p>
            <p>{`Shipment address can be changed by contacting our customer care team via WhatsApp or call before the order is shipped. Please note that in case the shipment has left our facility, changes cannot be made and all costs and charges of reshipment once received back will be borne by the customer.`}</p>
            <p>{`‣ Can I split and ship an order to multiple locations?`}</p>
            <p>{`Each order is shipped only to a single destination address. If you wish to ship products to different addresses, you are advised to create multiple orders with different shipping addresses. In rare cases, if an order needs to be split, please contact our customer team and they will do the needful.`}</p>
            <h3>{`ACCEPTANCE OF OUR SHIPPING POLICIES AND DISCLAIMERS`}</h3>
            <p>{`As we try our best to give all our customers smooth and joyful shopping experiences, there are certain situations beyond our control and our service is subject to terms & conditions. We would like to clearly state the following and placing an order on our website clearly means your acceptance to all terms and conditions as provided or as changed from time to time.`}</p>
            <ul className="list-disc pl-5 space-y-2">
            <li>{`We always try to get your parcels delivered before the standard mentioned time, however unprecedented delays due to Govt. restrictions, Rains, Floods, Pandemic or any beyond our control situations would require your patience while we work to get your goods to you.`}</li>
            <li>{`Before accepting delivery of any merchandise, please ensure that the packaging has not been damaged or tampered with. If you believe that the merchandise is not in good condition, or if the packaging is tampered with or damaged, before accepting delivery of the goods, please refuses to take delivery of the package, and contact our customer care department with your order reference number. We shall make our best efforts to ensure that a replacement delivery is made to you at the earliest.`}</li>
            <li>{`As shipment is done by third party, we shall not be responsible for any act, mishaps or delays in deliveries. Shipment details are shared and the customers are encouraged to follow up with shipment partners for all issues.`}</li>
            <li>{`Always make a clear video of opening the parcel for your safety. Any undoing by the shipping agents can only be dealt with in that situation.`}</li>
            <li>{`Not accepting of COD order may result in blacklisting of the customer details and you may not be able to order with us in future.`}</li>
            </ul>
            <p>{`*********************`}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
