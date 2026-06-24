import { createAdminClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
} from "lucide-react";

async function getDashboardStats() {
  try {
    const supabase = createAdminClient();
    const [
      { count: productCount },
      { count: orderCount },
      { count: customerCount },
      { data: recentOrders },
      { data: lowStockItems },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "customer"),
      supabase
        .from("orders")
        .select("id, order_number, total, status, created_at, shipping_address")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("inventory")
        .select("*, products(name)")
        .lt("quantity", 5)
        .limit(5),
    ]);

    // Revenue (total of paid orders)
    const { data: revenueData } = await supabase
      .from("orders")
      .select("total")
      .eq("payment_status", "paid");
    const totalRevenue = revenueData?.reduce((sum, o) => sum + o.total, 0) || 0;

    return {
      productCount: productCount || 0,
      orderCount: orderCount || 0,
      customerCount: customerCount || 0,
      totalRevenue,
      recentOrders: recentOrders || [],
      lowStockItems: lowStockItems || [],
    };
  } catch {
    return {
      productCount: 0,
      orderCount: 0,
      customerCount: 0,
      totalRevenue: 0,
      recentOrders: [],
      lowStockItems: [],
    };
  }
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-peach/30 text-peach-dark",
  confirmed: "bg-sky-brand text-ink",
  processing: "bg-lavender-brand/40 text-ink",
  shipped: "bg-sage/40 text-sage-dark",
  delivered: "bg-sage text-white",
  cancelled: "bg-blush/30 text-blush-dark",
};

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const STAT_CARDS = [
    {
      label: "Total Products",
      value: stats.productCount,
      icon: Package,
      color: "bg-sky-brand",
      href: "/admin/products",
    },
    {
      label: "Total Orders",
      value: stats.orderCount,
      icon: ShoppingCart,
      color: "bg-blush/30",
      href: "/admin/orders",
    },
    {
      label: "Customers",
      value: stats.customerCount,
      icon: Users,
      color: "bg-sage/30",
      href: "/admin/customers",
    },
    {
      label: "Revenue (Paid)",
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      color: "bg-lavender-brand/30",
      href: "/admin/orders",
      isPrice: true,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
          Dashboard
        </h1>
        <p className="text-ink-muted font-medium mt-1">
          Welcome back! Here&apos;s what&apos;s happening in your store.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((card) => (
          <Link key={card.label} href={card.href}>
            <div
              className={`${card.color} p-5 rounded-brand hover:shadow-soft transition-shadow cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-3">
                <card.icon size={20} className="text-ink" strokeWidth={1.8} />
                <ArrowRight size={14} className="text-ink-muted" />
              </div>
              <p className="font-bold text-ink text-2xl">{card.value}</p>
              <p className="text-ink-muted text-sm font-medium mt-1">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-brand shadow-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-ink text-lg">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-ink-muted hover:text-ink font-semibold flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-10 text-ink-muted">
              <ShoppingCart size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order: {
                id: string;
                order_number: string;
                total: number;
                status: string;
                created_at: string;
                shipping_address: { full_name: string };
              }) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-cream-dark transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-sm">{order.order_number}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {order.shipping_address?.full_name || "Customer"} •{" "}
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <p className="font-bold text-ink text-sm flex-shrink-0">
                    {formatPrice(order.total)}
                  </p>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-pill flex-shrink-0 ${
                      STATUS_COLORS[order.status] || "bg-cream-dark text-ink-muted"
                    }`}
                  >
                    {order.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-brand shadow-card p-5 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={18} className="text-peach-dark" />
            <h2 className="font-display font-semibold text-ink text-lg">
              Low Stock Alert
            </h2>
          </div>

          {stats.lowStockItems.length === 0 ? (
            <div className="text-center py-8 text-ink-muted">
              <p className="font-medium text-sm">All stock levels are healthy! ✓</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.lowStockItems.map((item: {
                id: string;
                quantity: number;
                products: { name: string } | null;
              }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-peach/10 border border-peach/20"
                >
                  <p className="text-sm font-semibold text-ink line-clamp-1 flex-1">
                    {(item.products as { name: string } | null)?.name || "Unknown Product"}
                  </p>
                  <span className="text-xs font-bold text-peach-dark ml-2">
                    {item.quantity} left
                  </span>
                </div>
              ))}
              <Link
                href="/admin/products"
                className="text-xs text-ink-muted hover:text-ink font-semibold flex items-center gap-1 mt-2"
              >
                Manage inventory <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 bg-cream-dark/50 rounded-brand p-5">
        <h3 className="font-semibold text-ink text-sm mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="btn-primary text-sm py-2.5 px-5">
            + Add Product
          </Link>
          <Link href="/admin/categories" className="btn-secondary text-sm py-2.5 px-5">
            Manage Categories
          </Link>
          <Link href="/admin/banners" className="btn-secondary text-sm py-2.5 px-5">
            Edit Banners
          </Link>
          <Link href="/admin/coupons" className="btn-secondary text-sm py-2.5 px-5">
            Create Coupon
          </Link>
        </div>
      </div>
    </div>
  );
}
