import { SupabaseClient } from "@supabase/supabase-js";
import { formatInvoiceNumber } from "@/lib/utils";

export const EXCHANGE_WINDOW_DAYS = 15;

interface OrderMatch {
  id: string;
  order_number: string;
  invoice_number: number | null;
}

/**
 * Finds an order by its order number OR its shorter customer-facing invoice
 * number (whichever is on the receipt), then verifies the given contact
 * (phone or email) actually belongs to it. Returns null on any mismatch —
 * callers should respond with the same generic "not found" message either
 * way, so a wrong contact never reveals that the order number exists.
 */
export async function findOrderByContact(
  supabase: SupabaseClient,
  orderNumber: string,
  contact: string
): Promise<OrderMatch | null> {
  const normalizedOrderNumber = orderNumber.trim().toUpperCase();
  const normalizedContact = contact.trim().toLowerCase();

  let order = (
    await supabase
      .from("orders")
      .select("id, order_number, invoice_number, shipping_address, guest_email, user_id")
      .eq("order_number", normalizedOrderNumber)
      .maybeSingle()
  ).data;

  if (!order) {
    const { data: candidates } = await supabase
      .from("orders")
      .select("id, order_number, invoice_number, shipping_address, guest_email, user_id")
      .not("invoice_number", "is", null);
    order =
      (candidates || []).find((o) => formatInvoiceNumber(o.invoice_number) === normalizedOrderNumber) ?? null;
  }

  if (!order) return null;

  let email: string | null = order.guest_email;
  if (order.user_id) {
    const { data: user } = await supabase.from("users").select("email").eq("id", order.user_id).single();
    email = user?.email || null;
  }
  const phone: string | null = order.shipping_address?.phone || null;

  const contactMatches =
    (phone && normalizedContact === phone.toLowerCase()) ||
    (email && normalizedContact === email.toLowerCase());

  if (!contactMatches) return null;

  return { id: order.id, order_number: order.order_number, invoice_number: order.invoice_number };
}

// Any existing request in one of these statuses blocks a new one for the
// same order item — 'rejected' and 'cancelled' are the only statuses that
// free the item up again (matches "not eligible for a second exchange":
// once genuinely in-flight or completed, it's done).
const BLOCKING_STATUSES = [
  "requested",
  "approved",
  "pickup_fee_pending",
  "pickup_scheduled",
  "picked_up",
  "received",
  "qc_passed",
  "qc_failed",
  "resolved",
];

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

interface OrderItemRow {
  id: string;
  product_id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  total_price: number;
}

/**
 * Server-side eligibility check for one order item, per the Exchange &
 * Credit Note Policy: delivered, within the 15-day window, not already
 * exchanged, and not a Flash Sale / Clearance item. Always re-run this on
 * the server at request-submit time too — never trust a client-side flag.
 */
export async function checkExchangeEligibility(
  supabase: SupabaseClient,
  orderId: string,
  orderItemId: string
): Promise<EligibilityResult> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, delivered_at")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return { eligible: false, reason: "Order not found" };
  }

  if (order.status !== "delivered" || !order.delivered_at) {
    return { eligible: false, reason: "This order hasn't been marked delivered yet" };
  }

  const deliveredAt = new Date(order.delivered_at);
  const daysSinceDelivery = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceDelivery > EXCHANGE_WINDOW_DAYS) {
    return {
      eligible: false,
      reason: `The ${EXCHANGE_WINDOW_DAYS}-day exchange window for this order has passed`,
    };
  }

  const { data: item, error: itemError } = await supabase
    .from("order_items")
    .select("id, product_id")
    .eq("id", orderItemId)
    .eq("order_id", orderId)
    .single();

  if (itemError || !item) {
    return { eligible: false, reason: "Item not found on this order" };
  }

  const { data: product } = await supabase
    .from("products")
    .select("is_clearance_sale")
    .eq("id", item.product_id)
    .single();

  if (product?.is_clearance_sale) {
    return { eligible: false, reason: "Flash Sale / Clearance items aren't eligible for exchange" };
  }

  const { data: existingRequests } = await supabase
    .from("exchange_requests")
    .select("id, status")
    .eq("order_item_id", orderItemId);

  const hasBlockingRequest = (existingRequests || []).some((r) =>
    BLOCKING_STATUSES.includes(r.status)
  );
  if (hasBlockingRequest) {
    return { eligible: false, reason: "This item already has an exchange request" };
  }

  return { eligible: true };
}

/** Fetches an order's items alongside a per-item eligibility verdict. */
export async function getOrderItemsWithEligibility(
  supabase: SupabaseClient,
  orderId: string
): Promise<Array<OrderItemRow & EligibilityResult>> {
  const { data: items } = await supabase
    .from("order_items")
    .select("id, product_id, product_name, variant_name, quantity, total_price")
    .eq("order_id", orderId);

  const rows = (items || []) as OrderItemRow[];
  const withEligibility = await Promise.all(
    rows.map(async (item) => ({
      ...item,
      ...(await checkExchangeEligibility(supabase, orderId, item.id)),
    }))
  );
  return withEligibility;
}
