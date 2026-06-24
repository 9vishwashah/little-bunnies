import { createAdminClient } from "@/lib/supabase/server";
import { Search } from "lucide-react";

async function getCustomers(search?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("users")
    .select(`*, orders(count)`, { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, count } = await query.limit(50);
  return { customers: data || [], count: count || 0 };
}

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const params = await searchParams;
  const { customers, count } = await getCustomers(params.search);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Customers</h1>
        <p className="text-ink-muted text-sm mt-0.5">{count} registered customers</p>
      </div>

      <form method="GET" className="mb-6">
        <div className="flex gap-3 max-w-md">
          <div className="flex items-center gap-2 bg-white rounded-brand border border-ink/8 px-4 py-2.5 flex-1">
            <Search size={16} className="text-ink-muted" />
            <input
              type="text"
              name="search"
              defaultValue={params.search}
              placeholder="Search by name or email..."
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
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-5 py-3.5">Customer</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Email</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Joined</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-ink-muted">No customers found</td>
                </tr>
              ) : (
                customers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-cream-dark/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center text-ink font-bold overflow-hidden">
                          {customer.avatar_url ? (
                            <img src={customer.avatar_url} alt={customer.full_name} className="w-full h-full object-cover" />
                          ) : (
                            customer.full_name?.charAt(0) || customer.email?.charAt(0) || "?"
                          )}
                        </div>
                        <p className="font-semibold text-ink text-sm">{customer.full_name || "Unknown"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{customer.email}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">
                      {new Date(customer.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center justify-center bg-cream-dark text-ink font-bold text-xs rounded-full min-w-6 h-6 px-1.5">
                        {customer.orders?.[0]?.count || 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
