import { createAdminClient } from "@/lib/supabase/server";

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  couponId?: string;
  code?: string;
  discountAmount?: number;
  type?: "percentage" | "fixed";
  value?: number;
}

/**
 * Server-side coupon check — shared by the live-validate endpoint the
 * checkout UI calls as the user types, and by create-order, which re-runs
 * this at submit time rather than trusting whatever the client last saw.
 */
export async function validateCoupon(
  code: string | null | undefined,
  subtotal: number
): Promise<CouponValidationResult> {
  if (!code) return { valid: false, error: "No coupon code provided" };

  const supabase = createAdminClient();
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !coupon) {
    return { valid: false, error: "Invalid or expired coupon code" };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, error: "This coupon has expired" };
  }

  if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
    return { valid: false, error: "This coupon has reached its usage limit" };
  }

  if (subtotal < coupon.min_order_amount) {
    return {
      valid: false,
      error: `Minimum order of ₹${coupon.min_order_amount} required for this coupon`,
    };
  }

  let discountAmount =
    coupon.type === "percentage" ? (subtotal * coupon.value) / 100 : coupon.value;

  if (coupon.max_discount_amount) {
    discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
  }
  discountAmount = Math.min(Math.round(discountAmount), subtotal);

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    discountAmount,
    type: coupon.type,
    value: coupon.value,
  };
}
