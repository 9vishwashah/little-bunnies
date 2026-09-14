import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice, formatInvoiceNumber } from "@/lib/utils";
import { Eye } from "lucide-react";

async function getExchangeRequests(status?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("exchange_requests")
    .select(
      "*, orders(order_number, invoice_number), order_items(product_name, variant_name, total_price)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, count } = await query.limit(50);
  return { requests: data || [], count: count || 0 };
}

const STATUS_COLORS: Record<string, string> = {
  requested: "bg-peach/30 text-peach-dark",
  approved: "bg-sky-brand text-ink",
  rejected: "bg-blush/30 text-blush-dark",
  pickup_fee_pending: "bg-lavender-brand/40 text-ink",
  pickup_scheduled: "bg-lavender-brand/40 text-ink",
  picked_up: "bg-lavender-brand/40 text-ink",
  received: "bg-sky-brand text-ink",
  qc_passed: "bg-sage/40 text-sage-dark",
  qc_failed: "bg-blush/30 text-blush-dark",
  resolved: "bg-sage text-white",
  cancelled: "bg-cream-dark text-ink-muted",
};

const STATUS_FILTERS = ["requested", "approved", "rejected", "resolved"];

export default async function AdminExchangesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const { requests, count } = await getExchangeRequests(params.status);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Exchange Requests</h1>
        <p className="text-ink-muted text-sm mt-0.5">{count} requests total</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Link
          href="/admin/exchanges"
          className={`text-xs font-semibold px-3 py-1.5 rounded-pill transition-colors ${
            !params.status ? "bg-ink text-white" : "bg-white text-ink-muted hover:text-ink"
          }`}
        >
          All
        </Link>
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={`/admin/exchanges?status=${s}`}
            className={`text-xs font-semibold px-3 py-1.5 rounded-pill capitalize transition-colors ${
              params.status === s ? "bg-ink text-white" : "bg-white text-ink-muted hover:text-ink"
            }`}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-brand shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cream-dark/50 border-b border-ink/8">
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-5 py-3.5">Order</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Item</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Requested</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Status</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-ink-muted">No exchange requests found</td>
                </tr>
              ) : (
                requests.map((r: any) => {
                  const displayOrderNumber =
                    typeof r.orders?.invoice_number === "number"
                      ? formatInvoiceNumber(r.orders.invoice_number)
                      : r.orders?.order_number;
                  return (
                    <tr key={r.id} className="hover:bg-cream-dark/30 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-ink text-sm">{displayOrderNumber}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-ink text-sm">{r.order_items?.product_name}</p>
                        {r.order_items?.variant_name && (
                          <p className="text-xs text-ink-muted">{r.order_items.variant_name}</p>
                        )}
                        <p className="text-xs text-ink-muted">{formatPrice(r.order_items?.total_price || 0)}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-ink-muted">
                        {new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-pill capitalize ${STATUS_COLORS[r.status] || "bg-cream-dark text-ink-muted"}`}>
                          {r.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/admin/exchanges/${r.id}`} className="btn-ghost text-xs p-2" title="View request">
                          <Eye size={16} />
                        </Link>
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
