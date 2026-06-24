import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Package, Eye } from "lucide-react";

export default async function AccountOrdersPage() {
  const { userId } = await auth();
  const supabase = createAdminClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <div className="bg-white rounded-brand shadow-card p-6 md:p-8">
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Order History</h1>

      {(!orders || orders.length === 0) ? (
        <div className="text-center py-12 bg-cream-dark/30 rounded-xl border border-ink/10">
          <Package size={48} className="mx-auto text-ink/30 mb-4" />
          <p className="font-semibold text-ink text-lg mb-2">No orders yet</p>
          <p className="text-sm text-ink-muted mb-6">Looks like you haven't made your first purchase.</p>
          <Link href="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => {
            const firstItem = order.order_items?.[0];
            const extraItemsCount = (order.order_items?.length || 1) - 1;

            return (
              <div key={order.id} className="border border-ink/10 rounded-xl overflow-hidden hover:border-ink/20 transition-colors">
                <div className="bg-cream-dark/30 p-4 border-b border-ink/10 flex flex-wrap gap-4 justify-between items-center text-sm">
                  <div>
                    <p className="text-ink-muted text-xs">Order Number</p>
                    <p className="font-bold text-ink">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-ink-muted text-xs">Date Placed</p>
                    <p className="font-semibold text-ink">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-ink-muted text-xs">Total Amount</p>
                    <p className="font-bold text-ink">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <Link href={`/account/orders/${order.id}`} className="btn-outline text-xs px-4 py-1.5 h-auto">
                      View Details
                    </Link>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-cream-dark overflow-hidden flex-shrink-0">
                      {firstItem?.product_image && (
                        <img src={firstItem.product_image} alt={firstItem.product_name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-sm line-clamp-1">{firstItem?.product_name}</p>
                      {firstItem?.variant_name && <p className="text-xs text-ink-muted mt-0.5">{firstItem.variant_name}</p>}
                      {extraItemsCount > 0 && <p className="text-xs font-medium text-ink mt-1">+{extraItemsCount} more items</p>}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage/20 text-sage-dark text-xs font-bold rounded-pill uppercase tracking-wider">
                      {order.status}
                    </span>
                    <p className="text-xs text-ink-muted mt-2">
                      Payment: <span className="font-semibold text-ink">{order.payment_method.toUpperCase()}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
