"use client";

import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, calculateShipping, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice } =
    useCartStore();
  const subtotal = getTotalPrice();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;
  const progressToFreeShipping = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-cream z-[110] flex flex-col shadow-soft-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink/8">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-ink" />
                <div>
                  <h2 className="font-display font-semibold text-ink text-lg leading-none">
                    Your Cart
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-xl hover:bg-cream-dark transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free shipping progress */}
            {subtotal < FREE_SHIPPING_THRESHOLD && items.length > 0 && (
              <div className="px-5 py-3 bg-sky-brand/30 border-b border-sky-brand">
                <p className="text-xs font-semibold text-ink mb-2">
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for{" "}
                  <span className="text-sage-dark">FREE shipping!</span>
                </p>
                <div className="h-1.5 rounded-full bg-sky-brand overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToFreeShipping}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-sage"
                  />
                </div>
              </div>
            )}
            {shipping === 0 && items.length > 0 && (
              <div className="px-5 py-2.5 bg-sage/20 border-b border-sage/30">
                <p className="text-xs font-semibold text-sage-dark">
                  🎉 You&apos;ve unlocked FREE shipping!
                </p>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-cream-dark flex items-center justify-center">
                    <ShoppingBag size={32} className="text-ink-muted" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-ink text-xl">
                      Your cart is empty
                    </p>
                    <p className="text-ink-muted text-sm mt-1">
                      Discover our premium baby essentials
                    </p>
                  </div>
                  <Link href="/products" onClick={closeCart} className="btn-primary">
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="px-4 space-y-3">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={`${item.id}-${item.variant?.id}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        layout
                        className="flex gap-3 bg-white p-3 rounded-brand shadow-soft-sm"
                      >
                        {/* Image */}
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="flex-shrink-0"
                        >
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-cream-dark">
                            <ProductImage
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              showSkeleton={false}
                            />
                          </div>
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={closeCart}
                          >
                            <h4 className="font-semibold text-ink text-sm line-clamp-2 leading-snug hover:text-ink-light transition-colors">
                              {item.name}
                            </h4>
                          </Link>
                          {item.variant && (
                            <p className="text-xs text-ink-muted mt-0.5">
                              {item.variant.name}: {item.variant.value}
                            </p>
                          )}
                          <p className="font-bold text-ink text-sm mt-1">
                            {formatPrice(
                              (item.price + (item.variant?.price_modifier || 0)) *
                                item.quantity
                            )}
                          </p>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 bg-cream-dark rounded-pill p-0.5">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.quantity - 1,
                                    item.variant?.id
                                  )
                                }
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-cream transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center text-sm font-bold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.quantity + 1,
                                    item.variant?.id
                                  )
                                }
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-cream transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <button
                              onClick={() =>
                                removeItem(item.id, item.variant?.id)
                              }
                              className="p-1.5 rounded-lg text-ink-muted hover:text-blush transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-ink/8 px-5 py-5 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-ink-light">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-ink-light">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-sage-dark font-semibold" : ""}>
                      {shipping === 0 ? "FREE" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-ink text-base pt-2 border-t border-ink/8">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full text-base"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="btn-ghost w-full text-sm justify-center"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
