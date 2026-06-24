"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
  className?: string;
  index?: number;
}

// Accent colors cycling for visual variety
const CARD_ACCENTS = [
  "bg-sky-brand",
  "bg-sage/40",
  "bg-blush/40",
  "bg-peach/40",
  "bg-lavender-brand/40",
  "bg-sky-brand/60",
  "bg-sage/30",
  "bg-blush/30",
];

export default function CategoryCard({
  name,
  slug,
  image,
  productCount,
  className,
  index = 0,
}: CategoryCardProps) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn("category-card group", className)}
    >
      <Link href={`/products?category=${slug}`} className="block">
        {/* Image */}
        <div className={cn("relative aspect-square overflow-hidden rounded-brand", accent)}>
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 480px) 45vw, (max-width: 768px) 22vw, 12vw"
              className="object-cover transition-transform duration-500 group-hover:scale-108"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/40" />
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-300 rounded-brand" />
        </div>

        {/* Name */}
        <div className="pt-3 pb-1 px-1">
          <h3 className="font-semibold text-ink text-sm text-center leading-tight">
            {name}
          </h3>
          {productCount !== undefined && (
            <p className="text-xs text-ink-muted text-center mt-0.5 font-medium">
              {productCount} products
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
