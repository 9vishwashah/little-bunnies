"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, calculateShipping, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import { toast } from "sonner";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const subtotal = getTotalPrice();
  const shipping = calculateShipping(subtotal);
  const total = subtotal - discount + shipping;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.discountAmount);
        setAppliedCoupon(couponCode.toUpperCase());
        toast.success(`Coupon applied! You saved ${formatPrice(data.discountAmount)}`);
      } else {
        toast.error(data.error || "Invalid coupon code");
      }
    } catch {
      toast.error("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="section-container py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full bg-cream-dark flex items-center justify-center mb-6">
            <ShoppingBag size={40} className="text-ink-muted" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink mb-2">
            Your cart is empty
          </h1>
          <p className="text-ink-muted font-medium mb-8 max-w-sm">
            Looks like you haven&apos;t added any products yet. Start shopping our
            premium baby essentials!
          </p>
          <Link href="/products" className="btn-primary">
            Explore Products
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section-container py-8 md:py-12">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-8">
        Shopping Cart
        <span className="text-ink-muted font-medium text-lg ml-3">
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={`${item.id}-${item.variant?.id}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-4 bg-white p-4 md:p-5 rounded-brand shadow-card"
              >
                <Link href={`/product/${item.slug}`} className="flex-shrink-0">
                  <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-cream-dark">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.slug}`}>
                    <h3 className="font-semibold text-ink text-sm md:text-base leading-snug hover:text-ink-light transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-ink-muted mt-1">
                      {item.variant.name}: {item.variant.value}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    {/* Quantity */}
                    <div className="flex items-center gap-1 bg-cream-dark rounded-pill p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant?.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant?.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="font-bold text-ink">
                        {formatPrice((item.price + (item.variant?.price_modifier || 0)) * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id, item.variant?.id)}
                        className="p-2 rounded-xl text-ink-muted hover:text-blush hover:bg-blush/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Continue shopping */}
          <div className="flex items-center justify-between pt-2">
            <Link href="/products" className="btn-ghost text-sm">
              ← Continue Shopping
            </Link>
            <button
              onClick={() => {
                clearCart();
                toast.success("Cart cleared");
              }}
              className="text-sm text-ink-muted hover:text-blush transition-colors font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-brand shadow-card p-5 md:p-6 sticky top-28">
            <h2 className="font-display font-semibold text-ink text-xl mb-5">
              Order Summary
            </h2>

            {/* Coupon */}
            <form onSubmit={handleApplyCoupon} className="mb-5">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-sage/20 rounded-xl border border-sage/30">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-sage-dark" />
                    <span className="text-sm font-semibold text-sage-dark">
                      {appliedCoupon} applied
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setDiscount(0);
                      setCouponCode("");
                    }}
                    className="text-xs text-ink-muted hover:text-ink transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="input-brand flex-1 text-sm py-2.5"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="btn-secondary px-4 py-2.5 text-sm flex-shrink-0"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
            </form>

            {/* Price breakdown */}
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between text-ink-light">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sage-dark font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-light">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-sage-dark font-semibold" : ""}>
                  {shipping === 0
                    ? "FREE"
                    : `${formatPrice(shipping)}`}
                </span>
              </div>
              {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-peach-dark font-medium bg-peach/20 rounded-xl p-2.5">
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for FREE shipping!
                </p>
              )}
              <div className="flex justify-between font-bold text-ink text-base border-t border-ink/8 pt-3 mt-3">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-ink-muted">GST included in price</p>
            </div>

            <Link href="/checkout" className="btn-primary w-full mt-5 text-base py-3.5">
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>

            {/* Trust */}
            <div className="mt-5 flex items-center justify-center gap-4 text-xs text-ink-muted font-medium">
              <span>🔒 Secure Checkout</span>
              <span>•</span>
              <span>🚚 COD Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
