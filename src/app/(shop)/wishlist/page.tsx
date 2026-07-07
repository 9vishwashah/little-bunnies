"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/types";
import ProductImage from "@/components/ui/ProductImage";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function WishlistPage() {
  const { items, toggleItem, isWishlisted } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("products")
      .select(
        "*, product_images(id, url, alt, is_primary, sort_order), categories(name, slug), product_variants(id, name, value, price_modifier, sku_suffix, image_url)"
      )
      .in("id", items)
      .eq("is_active", true)
      .then(({ data }) => {
        setProducts((data as unknown as Product[]) || []);
        setLoading(false);
      });
  }, [items]);

  return (
    <div className="section-container py-8 md:py-12 min-h-[60vh]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/products"
          className="p-2 rounded-xl hover:bg-cream-dark transition-colors"
          aria-label="Back to products"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink flex items-center gap-2">
            My Wishlist
            <Heart size={24} className="fill-red-500 text-red-500" />
          </h1>
          <p className="text-sm text-ink-muted font-medium mt-0.5">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>
      </div>

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-cream-dark flex items-center justify-center mb-6">
            <Heart size={40} className="text-ink/20" />
          </div>
          <h2 className="font-display text-xl font-bold text-ink mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-ink-muted font-medium text-sm mb-6 max-w-xs">
            Save products you love by tapping the heart icon on any product page.
          </p>
          <Link
            href="/products"
            className="btn-primary bg-ink text-cream px-6 py-3"
          >
            Browse Products
          </Link>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: items.length || 4 }).map((_, i) => (
            <div key={i} className="rounded-brand overflow-hidden animate-pulse">
              <div className="aspect-square bg-cream-dark" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-cream-dark rounded" />
                <div className="h-4 bg-cream-dark rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product grid */}
      {!loading && products.length > 0 && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          <AnimatePresence>
            {products.map((product) => {
              const primaryImage = product.product_images
                ?.sort((a, b) => a.sort_order - b.sort_order)[0];
              const discount = calculateDiscount(
                product.price,
                product.compare_price || 0
              );
              const wishlisted = isWishlisted(product.id);

              return (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white rounded-brand shadow-card overflow-hidden"
                >
                  {/* Image */}
                  <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden">
                    <ProductImage
                      src={primaryImage?.url || "/images/placeholder.jpg"}
                      alt={primaryImage?.alt || product.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 badge-sale text-xs px-2 py-0.5">
                        {discount}% OFF
                      </span>
                    )}
                    {/* Remove from wishlist */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleItem(product.id);
                        toast.success("Removed from wishlist");
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-soft hover:scale-110 active:scale-95 transition-all"
                      aria-label="Remove from wishlist"
                    >
                      <Heart
                        size={16}
                        className={cn(
                          "transition-all duration-200",
                          wishlisted
                            ? "fill-red-500 text-red-500"
                            : "text-ink/40"
                        )}
                      />
                    </button>
                  </Link>

                  {/* Info */}
                  <div className="p-3">
                    <Link href={`/product/${product.slug}`}>
                      <p className="text-xs text-ink-muted font-semibold uppercase tracking-wide mb-1 line-clamp-1">
                        {product.brand || product.categories?.name}
                      </p>
                      <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-2 mb-2 group-hover:text-ink-muted transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-bold text-ink text-base">
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-xs text-ink-muted line-through font-medium">
                          {formatPrice(product.compare_price)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        addToCart({
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          price: product.price,
                          image: primaryImage?.url || "/images/placeholder.jpg",
                          quantity: 1,
                        });
                        toast.success("Added to cart!");
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-full bg-ink text-cream text-xs font-semibold hover:bg-ink/80 active:scale-95 transition-all"
                    >
                      <ShoppingBag size={13} />
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
