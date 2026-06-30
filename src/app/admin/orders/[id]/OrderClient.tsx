"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, MapPin, Package, CreditCard, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface Props {
  order: any;
}

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "refunded", "failed"];

export default function OrderClient({ order }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, payment_status: paymentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      toast.success("Order updated successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const address = order.shipping_address;
  const whatsappMsg = `Hi ${address.full_name}, regarding your Little Bunnies order ${order.order_number}...`;
  const whatsappUrl = `https://wa.me/91${address.phone}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders" className="p-2 bg-white rounded-xl shadow-soft hover:shadow-card transition-shadow">
          <ArrowLeft size={20} className="text-ink" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Order #{order.order_number}</h1>
          <p className="text-ink-muted text-sm mt-0.5 flex items-center gap-2">
            <Clock size={14} />
            {new Date(order.created_at).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-brand shadow-card p-5 md:p-6">
            <h2 className="font-display font-semibold text-ink text-lg mb-4 flex items-center gap-2">
              <Package size={20} className="text-ink-muted" /> Order Items
            </h2>
            <div className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-4 border border-ink/8 rounded-xl bg-cream-dark/20">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                    {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ink text-sm">{item.product_name}</p>
                    {item.variant_name && <p className="text-xs text-ink-muted">{item.variant_name}</p>}
                    <p className="text-sm font-medium text-ink-muted mt-1">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                  </div>
                  <p className="font-bold text-ink text-sm">{formatPrice(item.total_price)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-ink/8 space-y-2 text-sm">
              <div className="flex justify-between text-ink-muted"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount_amount > 0 && <div className="flex justify-between text-sage-dark"><span>Discount</span><span>-{formatPrice(order.discount_amount)}</span></div>}
              <div className="flex justify-between text-ink-muted"><span>Shipping</span><span>{formatPrice(order.shipping_amount)}</span></div>
              <div className="flex justify-between font-bold text-ink text-lg pt-2 mt-2 border-t border-ink/8"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
            {order.notes?.startsWith("Custom Name Added:") && (
              <div className="mt-4 pt-4 border-t border-ink/8">
                <div className="flex items-center gap-3 bg-sage/10 border border-sage/30 rounded-xl px-4 py-3">
                  <span className="text-xl">✨</span>
                  <div>
                    <p className="text-xs font-bold text-sage-dark uppercase tracking-wider mb-0.5">Custom Name Requested</p>
                    <p className="font-bold text-ink text-lg">{order.notes.replace("Custom Name Added: ", "")}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-brand shadow-card p-5 md:p-6">
            <h2 className="font-display font-semibold text-ink text-lg mb-4">Order Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Fulfillment Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-brand text-sm">
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5 flex items-center justify-between">
                  <span>Payment Status</span>
                  <span className="text-xs text-ink-muted bg-cream-dark px-2 py-0.5 rounded">{order.payment_method.toUpperCase()}</span>
                </label>
                <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="input-brand text-sm">
                  {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <button onClick={handleUpdate} disabled={loading || (status === order.status && paymentStatus === order.payment_status)} className="btn-primary w-full text-sm py-3 mt-2">
                {loading ? "..." : <><Save size={16} /> Update Status</>}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-brand shadow-card p-5 md:p-6">
            <h2 className="font-display font-semibold text-ink text-lg mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-ink-muted" /> Customer & Delivery
            </h2>
            <div className="space-y-4 text-sm text-ink-light">
              <div>
                <p className="font-semibold text-ink">{address.full_name}</p>
                <p>{address.phone}</p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-semibold flex items-center gap-1 mt-1 text-xs">
                  <MessageCircle size={14} /> Message on WhatsApp
                </a>
              </div>
              <div className="pt-3 border-t border-ink/8">
                <p className="font-semibold text-ink mb-1">Shipping Address</p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>{address.city}, {address.state} {address.pincode}</p>
                <p>{address.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
