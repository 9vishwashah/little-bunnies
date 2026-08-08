"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  RotateCw,
  Feather,
  Sun,
  Compass,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

interface PramsLandingClientProps {
  products: Product[];
  comfyRiderPro: Product | null;
}

const WHY_CHOOSE_ITEMS = [
  {
    icon: RotateCw,
    title: "360° Smart Rotating Seat",
    description:
      "Effortlessly rotate between parent-facing and forward-facing modes with a single hand without disturbing your baby.",
  },
  {
    icon: Feather,
    title: "Ultra-Lightweight Aluminium",
    description:
      "Engineered with aerospace-grade aluminium frame for maximum stability and effortless one-hand lifting.",
  },
  {
    icon: Sun,
    title: "UPF 50++ Weather Canopy",
    description:
      "Full-coverage breathable linen canopy shields newborns from harsh UV rays, wind, and unexpected drizzles.",
  },
  {
    icon: Compass,
    title: "One-Touch Compact Fold",
    description:
      "Travel-friendly folding mechanism collapses in seconds to fit into airplane overhead cabins and small car boots.",
  },
];

const PRAM_FAQS = [
  {
    question: "Why is Little Bunnies Comfy Rider Pro the best baby stroller in India?",
    answer:
      "The Little Bunnies Comfy Rider Pro combines a 360° swivel seat, an ultra-lightweight aircraft-grade aluminium frame, all-terrain shock absorption, and a UPF 50++ canopy. It is designed to grow with your baby from 0–6 months and beyond while making travel effortless for parents.",
  },
  {
    question: "Can the seat rotate 360 degrees on Little Bunnies prams?",
    answer:
      "Yes! Our flagship Comfy Rider Pro features a 360-degree rotating reversible seat that lets your baby face you for bonding or face forward to explore the world, all with simple one-touch rotation.",
  },
  {
    question: "Are Little Bunnies prams and strollers travel-friendly?",
    answer:
      "Absolutely. Our prams are designed with a one-touch compact fold that collapses instantly. They are ultra-lightweight and compact enough to fit in car boots and are ideal for airport travel.",
  },
  {
    question: "What safety standards do Little Bunnies strollers meet?",
    answer:
      "Every Little Bunnies pram is equipped with a 5-point safety harness, reliable rear-wheel foot brakes, and anti-shock wheels tested for Indian road conditions to ensure complete newborn protection.",
  },
  {
    question: "Is there warranty and free shipping on Little Bunnies prams?",
    answer:
      "Yes! We provide free insured shipping across India on all orders above ₹5999, along with dedicated WhatsApp customer support (+91 89760 77070) and 15-day return eligibility.",
  },
  {
    question: "Which age group can use Little Bunnies prams?",
    answer:
      "Our prams and strollers are crafted with ergonomic full-recline support specifically tested for newborns aged 0–6 months, while offering durable construction suitable for toddlers.",
  },
];

export default function PramsLandingClient({
  products,
  comfyRiderPro,
}: PramsLandingClientProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const comfyRiderUrl =
    comfyRiderPro?.slug
      ? `/product/${comfyRiderPro.slug}`
      : "/product/little-bunnies-comfy-rider-pro-baby-stroller-360-rotating-reversible-seat-ultra-lightweight-aluminium-frame-upf-50-canopy-one-touch-fold-travel-friendly";

  const comfyImage =
    comfyRiderPro?.product_images?.find((img) => img.is_primary)?.url ||
    comfyRiderPro?.product_images?.[0]?.url ||
    "/images/pram.png?v=2";

  return (
    <div className="min-h-screen bg-cream">
      {/* ── 1. SEO HERO SECTION ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-10 pb-16 md:py-20 bg-gradient-to-b from-cream to-white border-b border-ink/5">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-peach-light/40 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-sage-light/40 blur-3xl" />
        </div>

        <div className="section-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-peach-light/60 text-peach-dark text-xs font-bold uppercase tracking-widest mb-4"
            >
              <Sparkles size={14} />
              <span>India&apos;s Favourite Baby Gear</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-ink leading-tight mb-6"
            >
              Little Bunnies Prams & Strollers
              <span className="block text-peach-dark text-2xl sm:text-3xl md:text-4xl font-normal mt-2">
                360° Reversible Seat & Ultra-Lightweight Comfort
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-ink-light text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8"
            >
              Discover India&apos;s most loved baby prams and strollers engineered for newborns aged 0–6 months. Featuring 360° smart swivel seats, aircraft-grade aluminium frames, UPF 50++ sun protection, and effortless one-touch folding.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href={comfyRiderUrl}
                className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold shadow-soft-lg hover:shadow-soft-xl transition-all"
              >
                <span>Shop Comfy Rider Pro</span>
                <ArrowRight size={18} />
              </Link>
              <a
                href="#all-prams"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-ink font-bold border border-ink/10 hover:bg-cream-dark transition-all"
              >
                <span>Browse All Models</span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. COMFY RIDER PRO SPOTLIGHT ──────────────────────────────────── */}
      <section className="py-12 md:py-20 bg-white">
        <div className="section-container">
          <div className="max-w-6xl mx-auto bg-cream rounded-[2.5rem] p-6 md:p-12 shadow-soft border border-ink/5 overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left Column: Image showcase */}
              <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square rounded-[2rem] bg-white overflow-hidden shadow-soft flex items-center justify-center p-6">
                <Image
                  src={comfyImage}
                  alt="Little Bunnies Comfy Rider Pro Baby Stroller — 360° Rotating Reversible Seat"
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-peach-dark text-white text-xs font-bold uppercase tracking-wide">
                  Flagship Best Seller
                </div>
              </div>

              {/* Right Column: Details & SEO links */}
              <div>
                <div className="flex items-center gap-1.5 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                  <span className="text-sm font-bold text-ink ml-1">4.9/5 (120+ Parents)</span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-4">
                  Little Bunnies Comfy Rider Pro Baby Stroller
                </h2>

                <p className="text-ink-light text-sm md:text-base leading-relaxed mb-6">
                  Engineered with a revolutionary <strong>360° rotating reversible seat</strong>, allowing your newborn to stay bonded with you or discover their surroundings with zero hassle. Crafted with an ultra-lightweight aluminium frame and UPF 50++ canopy.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  <div className="flex items-center gap-2 text-sm text-ink font-medium">
                    <CheckCircle2 size={18} className="text-sage-dark flex-shrink-0" />
                    <span>360° Swivel Seat Mechanism</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ink font-medium">
                    <CheckCircle2 size={18} className="text-sage-dark flex-shrink-0" />
                    <span>Ultra-Lightweight Aluminium</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ink font-medium">
                    <CheckCircle2 size={18} className="text-sage-dark flex-shrink-0" />
                    <span>UPF 50++ Weather Canopy</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ink font-medium">
                    <CheckCircle2 size={18} className="text-sage-dark flex-shrink-0" />
                    <span>One-Touch Travel Fold</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={comfyRiderUrl}
                    className="btn-primary px-8 py-4 rounded-full font-bold shadow-soft hover:shadow-soft-lg transition-all"
                  >
                    <span>View Product Details & Photos</span>
                  </Link>
                  {comfyRiderPro && (
                    <span className="text-2xl font-display font-bold text-ink">
                      ₹{comfyRiderPro.price.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. ALL PRAMS & STROLLERS GRID ─────────────────────────────────── */}
      <section id="all-prams" className="py-12 md:py-20 bg-cream">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-3">
              Explore Our Prams & Strollers Collection
            </h2>
            <p className="text-ink-light text-sm md:text-base">
              Every stroller is hand-inspected for newborn safety, comfort, and effortless parental mobility. Free shipping across India on orders above ₹5999.
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-ink/5">
              <p className="text-ink-light font-medium">
                No prams currently available online. Please contact us via WhatsApp at +91 89760 77070.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── 4. WHY CHOOSE LITTLE BUNNIES PRAMS ─────────────────────────────── */}
      <section className="py-12 md:py-20 bg-white">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-3">
              Why Parents Trust Little Bunnies Strollers
            </h2>
            <p className="text-ink-light text-sm md:text-base">
              Uncompromising engineering tailored specifically for Indian roads, weather conditions, and modern travel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-cream p-6 md:p-8 rounded-[2rem] border border-ink/5 hover:shadow-soft transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-peach-light/70 text-peach-dark flex items-center justify-center mb-5">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-ink-light leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. FAQ ACCORDION FOR GOOGLE RICH SNIPPETS (Hidden visually via sr-only for SEO) ─────────────────────── */}
      <section id="faq" className="sr-only">
        <div className="section-container max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-3">
              Frequently Asked Questions on Baby Prams
            </h2>
            <p className="text-ink-light text-sm md:text-base">
              Everything you need to know about Little Bunnies prams, strollers, safety, and shipping.
            </p>
          </div>

          <div className="space-y-4">
            {PRAM_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-ink/5 overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left font-display font-bold text-base md:text-lg text-ink hover:text-peach-dark transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={cn(
                        "text-ink-light transition-transform duration-300 flex-shrink-0 ml-4",
                        isOpen && "rotate-180 text-peach-dark"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-5 pb-5 md:px-6 md:pb-6 text-ink-light text-sm md:text-base leading-relaxed border-t border-ink/5 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
