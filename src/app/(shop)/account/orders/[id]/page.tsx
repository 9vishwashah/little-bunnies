import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, CreditCard, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", userId) // Ensure it belongs to the logged-in user
    .single();

  if (!order) notFound();

  return (
    <div className="bg-white rounded-brand shadow-card p-6 md:p-8">
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink transition-colors mb-6">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-ink/8 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Order #{order.order_number}</h1>
          <p className="text-sm text-ink-muted mt-1 flex items-center gap-2">
            <Calendar size={14} />
            Placed on {new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-sage/20 text-sage-dark text-xs font-bold rounded-pill uppercase tracking-wider">
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-sm font-bold text-ink-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin size={16} /> Delivery Address
          </h2>
          <div className="bg-cream-dark/30 p-4 rounded-xl border border-ink/10 text-sm">
            <p className="font-semibold text-ink text-base">{order.shipping_address?.full_name}</p>
            <p className="text-ink-muted mt-1">{order.shipping_address?.phone}</p>
            <p className="mt-3">{order.shipping_address?.address_line1}</p>
            {order.shipping_address?.address_line2 && <p>{order.shipping_address?.address_line2}</p>}
            <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}</p>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <CreditCard size={16} /> Payment Info
          </h2>
          <div className="bg-cream-dark/30 p-4 rounded-xl border border-ink/10 text-sm h-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-ink-muted">Method</span>
              <span className="font-semibold text-ink uppercase">{order.payment_method}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Status</span>
              <span className={`font-semibold px-2 py-0.5 rounded text-xs uppercase ${order.payment_status === 'paid' ? 'bg-sage/20 text-sage-dark' : 'bg-peach/20 text-peach-dark'}`}>
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-ink-muted uppercase tracking-wider mb-4 flex items-center gap-2">
          <Package size={16} /> Order Items
        </h2>
        <div className="border border-ink/10 rounded-xl overflow-hidden">
          <div className="divide-y divide-ink/10">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-cream-dark overflow-hidden flex-shrink-0 border border-ink/5">
                  {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product_id}`} className="font-semibold text-ink text-sm hover:text-lavender-brand-dark transition-colors line-clamp-1">
                    {item.product_name}
                  </Link>
                  {item.variant_name && <p className="text-xs text-ink-muted mt-1">{item.variant_name}</p>}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-medium text-ink-muted">Qty: {item.quantity}</p>
                    <p className="font-bold text-ink text-sm">{formatPrice(item.total_price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-cream-dark/30 p-5 border-t border-ink/10 space-y-2 text-sm">
            <div className="flex justify-between text-ink-muted">
              <span>Subtotal</span>
              <span className="font-medium text-ink">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sage-dark font-medium">
                <span>Discount</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-muted">
              <span>Shipping</span>
              <span className="font-medium text-ink">{order.shipping_amount === 0 ? "Free" : formatPrice(order.shipping_amount)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 mt-3 border-t border-ink/10">
              <span className="font-bold text-ink text-base">Total</span>
              <span className="font-bold text-ink text-xl">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
