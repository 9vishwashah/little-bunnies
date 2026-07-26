import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/orders/validateCoupon";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    const result = await validateCoupon(code, subtotal);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { valid: false, error: "Server error" },
      { status: 500 }
    );
  }
}
