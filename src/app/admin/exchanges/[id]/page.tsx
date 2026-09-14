import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import ExchangeClient from "./ExchangeClient";

async function getExchangeRequest(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("exchange_requests")
    .select(
      "*, orders(order_number, invoice_number, shipping_address), order_items(product_name, variant_name, quantity, unit_price, total_price, product_id)"
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function AdminExchangeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getExchangeRequest(id);
  if (!request) notFound();

  return <ExchangeClient request={request} />;
}
