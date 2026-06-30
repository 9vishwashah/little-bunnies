"use client";

import Link from "next/link";
import ProductImage from "./ProductImage";
import { motion } from "framer-motion";
import { ShoppingBag, Star } from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

import { Product } from "@/types";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export default function ProductCard({ product, className, priority }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const primaryImage = product.product_images?.find((img) => img.is_primary)
    || product.product_images?.[0];
  const discount = calculateDiscount(product.price, product.compare_price || 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: primaryImage?.url || "/images/placeholder.jpg",
      quantity: 1,
    });
    toast.success("Added to cart!", {
      description: product.name,
    });
  };


  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn("product-card group", className)}
    >
      <Link href={`/product/${product.slug}`} className="block" prefetch={true}>
        {/* Image container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-cream-dark rounded-t-brand">
          <ProductImage
            src={primaryImage?.url || "/images/placeholder.jpg"}
            alt={primaryImage?.alt || product.name}
            fill
            sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="badge-sale">{discount}% OFF</span>
            )}
            {product.is_new_arrival && (
              <span className="badge-new">NEW</span>
            )}
            {product.is_best_seller && (
              <span className="badge-featured">BESTSELLER</span>
            )}
          </div>


          {/* Quick add — always visible on mobile, hover-reveal on desktop */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold",
                "bg-ink text-cream hover:bg-ink-light transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "min-h-[44px]" // WCAG touch target
              )}
            >
              <ShoppingBag size={14} />
              {product.in_stock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

          {/* Out of stock overlay */}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-cream/60 flex items-center justify-center">
              <span className="text-sm font-semibold text-ink-muted bg-cream px-3 py-1.5 rounded-pill shadow-soft-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="p-3 md:p-4">
          {product.brand && (
            <p className="text-xs text-ink-muted font-semibold uppercase tracking-wider mb-1">
              {product.brand}
            </p>
          )}
          <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-2 mb-2 group-hover:text-ink-light transition-colors">
            {product.name}
          </h3>

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
            <span className="font-bold text-ink text-base">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-sm text-ink-muted line-through font-medium">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
