"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  RotateCw,
  Feather,
  Sun,
  Compass,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { Product } from "@/types";

interface PramsLandingClientProps {
  products: Product[];
  comfyRiderPro: Product | null;
}

// The sections above the product grid are switched off. They're hidden, not
// deleted: set a flag to true to bring a section back.
//   SHOW_HERO     – the big intro hero (it has its own <h1>)
//   SHOW_FLAGSHIP – the Comfy Rider Pro spotlight
//   SHOW_INTRO    – the heading + intro paragraph directly above the grid
// A page should always have exactly one <h1>, so when neither the hero nor the
// intro is shown, a visually hidden <h1> (screen readers / search engines
// only) is rendered above the grid instead.
const SHOW_HERO = false;
const SHOW_FLAGSHIP = false;
const SHOW_INTRO = false;

const GRID_HEADING_CLASS =
  "font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-3";

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
      "A lightweight aluminium frame keeps these strollers stable on the move and easy to lift with one hand.",
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

export default function PramsLandingClient({
  products,
  comfyRiderPro,
}: PramsLandingClientProps) {
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
      {/* ── 1. SEO HERO SECTION (hidden — see SHOW_HERO) ───────────────────── */}
      {SHOW_HERO && (
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
                <span>Little Bunnies Baby Gear</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-ink leading-tight mb-6"
              >
                Baby Prams & Strollers for Newborns
                <span className="block text-peach-dark text-2xl sm:text-3xl md:text-4xl font-normal mt-2">
                  360° Reversible, Lightweight &amp; Travel-Friendly
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-ink-light text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8"
              >
                Little Bunnies baby prams and strollers for newborns and growing babies — 360° rotating reversible seats, lightweight aluminium frames, UV-protective canopies and compact folds for car boots and air travel. Choose from the Comfy Rider range, Cocoon, Urban Glider, Eco Pro, a twin stroller and more.
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
      )}

      {/* ── 2. COMFY RIDER PRO SPOTLIGHT (hidden — see SHOW_FLAGSHIP) ──────── */}
      {SHOW_FLAGSHIP && (
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
                    Flagship Model
                  </div>
                </div>

                {/* Right Column: Details & SEO links */}
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-4">
                    Little Bunnies Comfy Rider Pro Baby Stroller
                  </h2>

                  <p className="text-ink-light text-sm md:text-base leading-relaxed mb-6">
                    Engineered with a revolutionary <strong>360° rotating reversible seat</strong>, allowing your newborn to stay bonded with you or discover their surroundings with zero hassle. Built on a lightweight aluminium frame with a UPF 50+ canopy.
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
      )}

      {/* ── 3. ALL PRAMS & STROLLERS GRID ─────────────────────────────────── */}
      <section
        id="all-prams"
        className={
          SHOW_INTRO
            ? "py-12 md:py-20 bg-cream"
            : "pt-8 pb-12 md:pt-12 md:pb-20 bg-cream"
        }
      >
        <div className="section-container">
          {SHOW_INTRO ? (
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
              {SHOW_HERO ? (
                <h2 className={GRID_HEADING_CLASS}>
                  Explore Our Prams &amp; Strollers Collection
                </h2>
              ) : (
                <h1 className={GRID_HEADING_CLASS}>
                  Baby Prams &amp; Strollers for Newborns
                </h1>
              )}
              <p className="text-ink-light text-sm md:text-base leading-relaxed">
                Little Bunnies baby prams and strollers for newborns and growing babies — 360° rotating reversible seats, lightweight aluminium frames and compact folds for car boots and air travel. Free shipping across India on orders above ₹5,999.
              </p>
            </div>
          ) : (
            !SHOW_HERO && (
              <h1 className="sr-only">Baby Prams &amp; Strollers for Newborns</h1>
            )
          )}

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
              Lightweight frames, newborn-friendly recline and compact folds — designed around how Indian families actually travel.
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

    </div>
  );
}
