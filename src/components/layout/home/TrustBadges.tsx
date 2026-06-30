"use client";

import { Truck, ShieldCheck, Undo2, HeadphonesIcon } from "lucide-react";
import { motion } from "framer-motion";

const BADGES = [
  {
    title: "Free Shipping",
    desc: "On orders above ₹5999",
    icon: Truck,
    color: "text-lavender-brand-dark",
    bg: "bg-lavender-brand-light/40",
  },
  {
    title: "Secure Payment",
    desc: "100% protected",
    icon: ShieldCheck,
    color: "text-sage-dark",
    bg: "bg-sage-light/40",
  },
  {
    title: "Easy Returns",
    desc: "15 days return policy",
    icon: Undo2,
    color: "text-peach-dark",
    bg: "bg-peach-light/40",
  },
  {
    title: "Happy Support",
    desc: "We're here for you",
    icon: HeadphonesIcon,
    color: "text-sky-brand-dark",
    bg: "bg-sky-brand/30",
  },
];

export default function TrustBadges() {
  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {BADGES.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col items-center text-center gap-3 group"
              >
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${badge.bg}`}
                >
                  <Icon size={30} strokeWidth={1.6} className={badge.color} />
                </div>
                <div>
                  <p className="font-bold text-ink text-sm md:text-base leading-snug">
                    {badge.title}
                  </p>
                  <p className="text-xs md:text-sm text-ink-muted mt-0.5">
                    {badge.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
