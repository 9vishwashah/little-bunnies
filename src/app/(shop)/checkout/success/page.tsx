import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Download } from "lucide-react";
import ClearCartOnMount from "./ClearCartOnMount";
import PurchaseTracker from "./PurchaseTracker";
import { createAdminClient } from "@/lib/supabase/server";
import { formatInvoiceNumber } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ order?: string; id?: string }>;
}

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

export default async function OrderSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderId = params.id;

  // Same LB001-style number shown on the PDF and in the admin panel — the
  // RPC is idempotent (returns the existing number if one's already
  // assigned), so this both looks it up and self-heals any order that
  // somehow reached this page before its number was assigned.
  let orderNumber = params.order;

  // Meta Pixel Purchase data — deliberately re-fetched from the order
  // itself rather than trusted from the URL, and only used when the order
  // is genuinely marked paid. This page is only ever reached (via
  // ablepay-return) after finalizeAblepayCallback has already confirmed
  // payment, but this is a real ecommerce conversion event, so it's worth
  // the extra guard rather than assuming.
  let purchaseData: { contentIds: string[]; numItems: number; value: number } | null = null;

  if (orderId) {
    try {
      const supabase = createAdminClient();
      const { data: invoiceNumberRaw } = await supabase.rpc("get_or_create_invoice_number", {
        p_order_id: orderId,
      });
      if (typeof invoiceNumberRaw === "number") {
        orderNumber = formatInvoiceNumber(invoiceNumberRaw);
      }

      const { data: order } = await supabase
        .from("orders")
        .select("total, payment_status")
        .eq("id", orderId)
        .single();

      if (order?.payment_status === "paid") {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("product_id, quantity")
          .eq("order_id", orderId);

        purchaseData = {
          contentIds: (orderItems || []).map((item) => item.product_id),
          numItems: (orderItems || []).reduce((sum, item) => sum + item.quantity, 0),
          value: order.total,
        };
      }
    } catch (err) {
      console.error("Order success invoice-number lookup error:", err);
    }
  }

  return (
    <div className="section-container py-12 md:py-20 flex flex-col items-center justify-center min-h-[80vh] bg-cream-gradient relative">
      <ClearCartOnMount />
      {orderId && purchaseData && (
        <PurchaseTracker
          orderId={orderId}
          contentIds={purchaseData.contentIds}
          numItems={purchaseData.numItems}
          value={purchaseData.value}
        />
      )}
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sage-light/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lavender-brand-light/20 rounded-full blur-3xl" />

      {/* Receipt Card */}
      <div className="w-full max-w-md bg-white rounded-brand shadow-soft-xl overflow-hidden relative z-10 border border-ink/5">
        {/* Top Header */}
        <div className="bg-sage/15 px-8 py-10 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_100%)]" />
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 relative z-10 shadow-soft-sm overflow-hidden p-2">
            <Image src="/images/logo.png" alt="Little Bunnies" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="font-display text-4xl font-bold text-ink relative z-10">
            Thank You!
          </h1>
          <p className="text-ink-muted text-xs uppercase tracking-widest mt-3 font-bold bg-white/60 backdrop-blur-sm border border-ink/5 px-4 py-1.5 rounded-full relative z-10 shadow-sm">
            Payment Confirmed
          </p>
        </div>

        {/* Receipt Body */}
        <div className="p-8">
          <div className="flex flex-col items-center border-b-2 border-dashed border-ink/10 pb-6 mb-6">
            <p className="text-xs text-ink-muted uppercase tracking-widest font-bold mb-2">Order Reference</p>
            <p className="text-2xl font-mono font-bold text-ink bg-cream-dark/50 border border-ink/5 px-6 py-2.5 rounded-xl">
              {orderNumber || "Processing..."}
            </p>
          </div>

          <div className="text-center space-y-3 mb-8">
            <p className="text-ink font-semibold text-lg">
              We're getting your order ready! 🐰
            </p>
            <p className="text-sm text-ink-muted leading-relaxed">
              Your order has been successfully placed. We will send you shipping confirmations and updates shortly.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {orderId && (
              <a
                href={`/api/orders/${orderId}/invoice`}
                className="w-full py-4 px-4 bg-ink hover:bg-ink/85 text-cream rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all"
              >
                <Download size={18} />
                Download Invoice (PDF)
              </a>
            )}

            <a
              href={`https://wa.me/918976077070?text=${encodeURIComponent(`Hi Little Bunnies! I would like to track my order ${orderNumber}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)]"
            >
              <WhatsAppIcon />
              Track Order via WhatsApp
            </a>

            <Link href="/products" className="btn-ghost w-full justify-center mt-2 text-ink-muted hover:text-ink">
              Continue Shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
