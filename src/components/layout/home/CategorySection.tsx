"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Baby, 
  Car, 
  Shirt, 
  Coffee, 
  HeartPulse, 
  Gamepad2, 
  BedDouble, 
  Package 
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "Stroller", slug: "prams", color: "bg-sage-light/50", icon: Car, image: "/images/pram.png" },
  { name: "Diaper Bags", slug: "diapers", color: "bg-lavender-brand-light/50", icon: Package, image: "/images/diapers.png" },
  { name: "Utility Bags", slug: "bags", color: "bg-sage-light/30", icon: HeartPulse, image: "/images/bags.png" },
];

export default function CategorySection() {
  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
          {CATEGORIES.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link href={`/products?category=${cat.slug}`} className="group flex flex-col items-center text-center">
                  <div className={cn(
                    "w-full aspect-[4/3] sm:aspect-square rounded-[1.5rem] flex items-center justify-center mb-3 transition-all duration-300 relative overflow-hidden",
                    "group-hover:shadow-soft group-hover:-translate-y-1",
                    cat.color
                  )}>
                    {cat.image ? (
                      <Image 
                        src={cat.image} 
                        alt={cat.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <Icon size={36} strokeWidth={1.5} className="text-ink/60 group-hover:scale-110 group-hover:text-ink transition-all" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-ink group-hover:text-peach-dark transition-colors">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
