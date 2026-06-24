import { createAdminClient } from "@/lib/supabase/server";
import BannersClient from "./BannersClient";

export default async function AdminBannersPage() {
  const supabase = createAdminClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Banners</h1>
        <p className="text-ink-muted text-sm mt-1">Manage promotional banners</p>
      </div>
      <BannersClient initialBanners={banners || []} />
    </div>
  );
}
