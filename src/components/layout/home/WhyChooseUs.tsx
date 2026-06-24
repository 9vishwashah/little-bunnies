"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Heart, Leaf, Rabbit } from "lucide-react";
import { cn } from "@/lib/utils";

const REASONS = [
  {
    title: "Premium Quality",
    desc: "Carefully selected for your baby",
    icon: BadgeCheck,
    color: "text-lavender-brand-dark",
    bg: "bg-lavender-brand-light/40",
  },
  {
    title: "Loved by Parents",
    desc: "Trusted by thousands of happy parents",
    icon: Heart,
    color: "text-peach-dark",
    bg: "bg-peach-light/40",
  },
  {
    title: "Safe & Non-toxic",
    desc: "Gentle, safe & best for little ones",
    icon: Leaf,
    color: "text-sage-dark",
    bg: "bg-sage-light/40",
  },
  {
    title: "Designed for Comfort",
    desc: "Products that make parenting easier",
    icon: Rabbit,
    color: "text-sky-brand-dark",
    bg: "bg-sky-brand/40",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="section-container">
        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-8 md:mb-10">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-sage-dark/30" />
            <div className="w-2 h-2 rounded-full bg-sage-dark/60" />
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink text-center">
            Why Parents Love Little Bunnies
          </h2>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-sage-dark/60" />
            <div className="w-2 h-2 rounded-full bg-sage-dark/30" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {REASONS.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className={cn(
                  "w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110",
                  reason.bg
                )}>
                  <Icon size={36} strokeWidth={1.5} className={reason.color} />
                </div>
                <h3 className="font-bold text-ink text-base md:text-lg mb-2">
                  {reason.title}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed max-w-[200px]">
                  {reason.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
