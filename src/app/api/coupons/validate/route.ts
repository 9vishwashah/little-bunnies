import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) {
      return NextResponse.json({ valid: false, error: "No coupon code provided" });
    }

    const supabase = createAdminClient();
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: "Invalid or expired coupon code" });
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" });
    }

    // Check max uses
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" });
    }

    // Check min order
    if (subtotal < coupon.min_order_amount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order of ₹${coupon.min_order_amount} required for this coupon`,
      });
    }

    // Calculate discount
    let discountAmount =
      coupon.type === "percentage"
        ? (subtotal * coupon.value) / 100
        : coupon.value;

    if (coupon.max_discount_amount) {
      discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
    }

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      discountAmount: Math.round(discountAmount),
      type: coupon.type,
      value: coupon.value,
    });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Server error" },
      { status: 500 }
    );
  }
}
