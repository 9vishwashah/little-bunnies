import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateInvoicePdf } from "@/lib/invoice/generateInvoicePdf";
import { getPaymentMethodLabel } from "@/lib/orders/paymentMethodLabel";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        "order_number, created_at, subtotal, discount_amount, custom_name_charge, coupon_id, shipping_amount, total, razorpay_payment_id, payment_method, payment_status, user_id, guest_email, shipping_address"
      )
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Invoice is only available once the order is paid" },
        { status: 403 }
      );
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, variant_name, quantity, unit_price, total_price")
      .eq("order_id", id);

    const email = order.user_id
      ? (await supabase.from("users").select("email").eq("id", order.user_id).single()).data?.email
      : order.guest_email;

    let couponCode: string | null = null;
    if (order.coupon_id) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("code")
        .eq("id", order.coupon_id)
        .single();
      couponCode = coupon?.code || null;
    }

    const pdf = await generateInvoicePdf(
      { ...order, coupon_code: couponCode, payment_method_label: getPaymentMethodLabel(order.payment_method) },
      items || [],
      email
    );

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${order.order_number}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("Admin invoice generation error:", err);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
