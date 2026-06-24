import { createAdminClient } from "@/lib/supabase/server";
import CouponsClient from "./CouponsClient";

export default async function AdminCouponsPage() {
  const supabase = createAdminClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Coupons</h1>
        <p className="text-ink-muted text-sm mt-1">Manage discount codes</p>
      </div>
      <CouponsClient initialCoupons={coupons || []} />
    </div>
  );
}
