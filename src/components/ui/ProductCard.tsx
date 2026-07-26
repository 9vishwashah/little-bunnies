"use client";

import Link from "next/link";
import ProductImage from "./ProductImage";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export default function ProductCard({ product, className, priority }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  let primaryImage = product.product_images?.find((img) => img.is_primary)
    || product.product_images?.[0];

  if (!primaryImage && product.product_variants) {
    for (const v of product.product_variants) {
      if (v.image_url) {
        try {
          const parsed = JSON.parse(v.image_url);
          if (parsed.gallery && parsed.gallery.length > 0) {
            primaryImage = { id: v.id, url: parsed.gallery[0], alt: product.name, is_primary: true, sort_order: 0, product_id: product.id } as any;
            break;
          }
        } catch (e) {}
      }
    }
  }


  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn("product-card group relative flex flex-col h-full", className)}
    >
      <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" prefetch={true}>
        <span className="sr-only">View {product.name}</span>
      </Link>

      <div className="relative z-0 flex-1 flex flex-col">
        {/* Image container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-t-brand">
          <ProductImage
            src={primaryImage?.url || "/images/placeholder.jpg"}
            alt={primaryImage?.alt || product.name}
            fill
            sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
            {product.is_new_arrival && (
              <span className="badge-new">NEW</span>
            )}
            {product.is_best_seller && (
              <span className="badge-featured">BESTSELLER</span>
            )}
          </div>


          {/* Add to Cart CTA — always visible on mobile, hover-reveal on desktop */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!product.in_stock) return;
                const primaryImg = product.product_images?.find((img) => img.is_primary) || product.product_images?.[0];
                addItem({
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  image: primaryImg?.url || "/images/placeholder.jpg",
                  quantity: 1,
                });
                openCart();
                toast.success("Added to cart!", { description: product.name });
              }}
              disabled={!product.in_stock}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold",
                "bg-[#3B7EBD] text-white hover:bg-[#2B659B] hover:shadow-soft transition-all active:scale-[0.98]",
                "min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              <ShoppingCart size={14} />
              Shop Now
            </button>
          </div>

          {/* Out of stock overlay */}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-cream/70 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="badge-stock">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="p-3 md:p-4">
          <div className="min-h-[4rem] mb-2 flex flex-col justify-start">
            {product.brand && (
              <span className="inline-block px-2.5 py-0.5 bg-ink/5 border border-ink/10 text-ink text-xs font-bold uppercase tracking-wider rounded mb-1.5 self-start">
                {product.brand}
              </span>
            )}
            <h3 className="font-sans font-light text-ink-muted text-xs tracking-wide leading-relaxed line-clamp-2 group-hover:text-[#3B7EBD] transition-colors">
              {product.name}
            </h3>
          </div>

          {/* Rating */}
          {product.review_count && product.review_count > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={11}
                    className={
                      star <= Math.round(product.avg_rating || 0)
                        ? "text-peach fill-peach"
                        : "text-ink/20 fill-ink/10"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-ink-muted font-medium">
                ({product.review_count})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-ink text-base md:text-lg">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-xs md:text-sm text-ink-muted line-through font-medium">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
