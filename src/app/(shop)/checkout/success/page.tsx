import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderNumber = params.order;

  return (
    <div className="section-container py-20 flex flex-col items-center justify-center text-center min-h-[70vh]">
      <div className="w-20 h-20 rounded-full bg-sage/20 flex items-center justify-center mb-6">
        <CheckCircle size={40} className="text-sage-dark" />
      </div>

      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-3">
        Order Placed Successfully! 🎉
      </h1>

      {orderNumber && (
        <div className="bg-cream-dark rounded-brand px-6 py-3 mb-4">
          <p className="text-sm text-ink-muted font-medium">Order Number</p>
          <p className="font-bold text-ink text-xl">{orderNumber}</p>
        </div>
      )}

      <p className="text-ink-muted font-medium max-w-md mb-3">
        Thank you for shopping with Little Bunnies! 🐰 Your order has been
        confirmed and will be delivered soon.
      </p>
      <p className="text-sm text-ink-muted mb-8">
        You&apos;ll receive updates via WhatsApp on{" "}
        <span className="font-semibold">+91 95945 03214</span>
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/account/orders" className="btn-primary">
          <Package size={18} />
          Track My Order
        </Link>
        <Link href="/products" className="btn-secondary">
          Continue Shopping
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* WhatsApp order update */}
      <a
        href={`https://wa.me/919594503214?text=${encodeURIComponent(`Hi, I just placed order ${orderNumber} on Little Bunnies. Can you confirm the delivery timeline?`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 text-sm text-[#25D366] font-semibold hover:underline"
      >
        💬 Chat with us on WhatsApp for updates
      </a>
    </div>
  );
}
