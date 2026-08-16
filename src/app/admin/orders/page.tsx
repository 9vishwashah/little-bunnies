import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice, formatInvoiceNumber } from "@/lib/utils";
import { Eye, Search, Plus } from "lucide-react";
import DeleteOrderButton from "./DeleteOrderButton";

async function getOrders(search?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select(`*, users(full_name, email)`, { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`order_number.ilike.%${search}%,shipping_address->>full_name.ilike.%${search}%`);
  }

  const { data, count } = await query.limit(50);
  return { orders: data || [], count: count || 0 };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-peach/30 text-peach-dark",
  confirmed: "bg-sky-brand text-ink",
  processing: "bg-lavender-brand/40 text-ink",
  shipped: "bg-sage/40 text-sage-dark",
  delivered: "bg-sage text-white",
  cancelled: "bg-blush/30 text-blush-dark",
};

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const params = await searchParams;
  const { orders, count } = await getOrders(params.search);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Orders</h1>
          <p className="text-ink-muted text-sm mt-0.5">{count} orders total</p>
        </div>
        <Link href="/admin/orders/new" className="btn-primary flex items-center gap-1.5 shrink-0">
          <Plus size={16} />
          New Walk-in Sale
        </Link>
      </div>

      <form method="GET" className="mb-6">
        <div className="flex gap-3 max-w-md">
          <div className="flex items-center gap-2 bg-white rounded-brand border border-ink/8 px-4 py-2.5 flex-1">
            <Search size={16} className="text-ink-muted" />
            <input
              type="text"
              name="search"
              defaultValue={params.search}
              placeholder="Search by order # or name..."
              className="flex-1 bg-transparent text-sm text-ink placeholder-ink-muted outline-none"
            />
          </div>
          <button type="submit" className="btn-secondary px-5">Search</button>
        </div>
      </form>

      <div className="bg-white rounded-brand shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cream-dark/50 border-b border-ink/8">
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-5 py-3.5">Order</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Date</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Customer</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Custom Name</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Total</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Payment</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Status</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-ink-muted">No orders found</td>
                </tr>
              ) : (
                orders.map((order: any) => {
                  const displayOrderNumber =
                    typeof order.invoice_number === "number" ? formatInvoiceNumber(order.invoice_number) : order.order_number;
                  return (
                  <tr key={order.id} className="hover:bg-cream-dark/30 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-ink text-sm">
                      {displayOrderNumber}
                      {order.is_walk_in && (
                        <span className="block mt-1 w-fit text-[10px] font-bold px-1.5 py-0.5 rounded bg-lavender-brand/40 text-ink">
                          WALK-IN
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-ink text-sm">{order.shipping_address?.full_name}</p>
                      <p className="text-xs text-ink-muted">{order.shipping_address?.phone}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      {order.notes?.startsWith("Custom Name Added:") ? (
                        <span className="inline-flex items-center gap-1 bg-sage/20 text-sage-dark text-xs font-bold px-2 py-1 rounded-full">
                          ✨ {order.notes.replace("Custom Name Added: ", "")}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-ink text-sm">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-ink uppercase">{order.payment_method}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${order.payment_status === "paid" ? "bg-sage/20 text-sage-dark" : "bg-peach/20 text-peach-dark"}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-pill ${STATUS_COLORS[order.status] || "bg-cream-dark text-ink-muted"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/orders/${order.id}`} className="btn-ghost text-xs p-2" title="View order">
                          <Eye size={16} />
                        </Link>
                        <DeleteOrderButton orderId={order.id} orderNumber={displayOrderNumber} />
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
