import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import OrderClient from "./OrderClient";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(*),
      users(full_name, email)
    `)
    .eq("id", id)
    .single();

  if (!order) notFound();

  return <OrderClient order={order} />;
}
