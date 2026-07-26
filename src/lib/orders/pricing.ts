import { createAdminClient } from "@/lib/supabase/server";
import { calculateShipping } from "@/lib/utils";

export const CUSTOM_NAME_CHARGE = 299;

export interface PricingCartItem {
  id: string; // product_id
  name: string;
  image: string;
  quantity: number;
  variant?: { id: string; name: string; value: string };
}

export interface ResolvedOrderItem {
  product_id: string;
  variant_id: string | null;
  product_name: string;
  product_image: string | null;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderPricing {
  subtotal: number;
  shipping: number;
  customNameCharge: number;
  total: number;
  resolvedItems: ResolvedOrderItem[];
}

export class PricingError extends Error {}

/**
 * Recomputes order totals from the database instead of trusting client-sent
 * prices, so a tampered cart request can't be used to under-pay via Razorpay.
 */
export async function computeOrderPricing(
  items: PricingCartItem[],
  hasCustomName: boolean
): Promise<OrderPricing> {
  if (!items || items.length === 0) {
    throw new PricingError("Cart is empty");
  }

  const supabase = createAdminClient();
  const productIds = Array.from(new Set(items.map((i) => i.id)));

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, price, is_active, in_stock")
    .in("id", productIds);

  if (productsError) {
    throw new PricingError("Failed to validate products");
  }

  const productMap = new Map((products || []).map((p) => [p.id, p]));

  const variantIds = Array.from(
    new Set(items.map((i) => i.variant?.id).filter((v): v is string => Boolean(v)))
  );

  let variantMap = new Map<string, { id: string; product_id: string; price_modifier: number }>();
  if (variantIds.length > 0) {
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("id, product_id, price_modifier")
      .in("id", variantIds);

    if (variantsError) {
      throw new PricingError("Failed to validate product options");
    }
    variantMap = new Map((variants || []).map((v) => [v.id, v]));
  }

  const resolvedItems: ResolvedOrderItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.id);
    if (!product) {
      throw new PricingError(`Product "${item.name}" is no longer available`);
    }
    if (!product.is_active || !product.in_stock) {
      throw new PricingError(`"${item.name}" is currently out of stock`);
    }
    if (!item.quantity || item.quantity <= 0) {
      throw new PricingError(`Invalid quantity for "${item.name}"`);
    }

    let priceModifier = 0;
    if (item.variant?.id) {
      const variant = variantMap.get(item.variant.id);
      if (!variant || variant.product_id !== item.id) {
        throw new PricingError(`Selected option for "${item.name}" is no longer available`);
      }
      priceModifier = Number(variant.price_modifier) || 0;
    }

    const unitPrice = Number(product.price) + priceModifier;
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    resolvedItems.push({
      product_id: item.id,
      variant_id: item.variant?.id || null,
      product_name: item.name,
      product_image: item.image || null,
      variant_name: item.variant ? `${item.variant.name}: ${item.variant.value}` : null,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
    });
  }

  const shipping = calculateShipping(subtotal);
  const customNameCharge = hasCustomName ? CUSTOM_NAME_CHARGE : 0;
  const total = Math.round((subtotal + shipping + customNameCharge) * 100) / 100;

  return { subtotal, shipping, customNameCharge, total, resolvedItems };
}
