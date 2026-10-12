"use client";

import { useState, useEffect, useId } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Copy, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { PROMO_COUPON_CODE, PROMO_COUPON_LABEL } from "@/lib/utils";

const GOLD = "#F5C451";
const SAFFRON = "#F08A1C";
const MAROON = "#3B0A1E";

/** A single clay diya with a flickering flame. `size` is the rendered width in px. */
function Diya({ size, delay = 0 }: { size: number; delay?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size * 0.78}
      viewBox="0 0 120 94"
      fill="none"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD36B" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFD36B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`flame-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FF8A00" />
          <stop offset="60%" stopColor="#FFC23D" />
          <stop offset="100%" stopColor="#FFF3B0" />
        </linearGradient>
        <linearGradient id={`bowl-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E9892B" />
          <stop offset="100%" stopColor="#9A4313" />
        </linearGradient>
      </defs>

      {/* Warm halo behind the flame */}
      <motion.circle
        cx="60"
        cy="30"
        r="34"
        fill={`url(#glow-${uid})`}
        animate={{ opacity: [0.7, 1, 0.75, 1, 0.7], scale: [1, 1.08, 1, 1.05, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, delay, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      {/* Flame */}
      <motion.g
        animate={{ scaleY: [1, 1.12, 0.95, 1.08, 1], scaleX: [1, 0.94, 1.04, 0.97, 1], rotate: [0, -2, 2, -1, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, delay, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
      >
        <path
          d="M60 4 C52 20 44 28 51 41 C54 47 66 47 69 41 C76 28 68 20 60 4 Z"
          fill={`url(#flame-${uid})`}
        />
        <path d="M60 22 C56 30 54 35 58 41 C60 43 62 43 63 41 C66 35 63 30 60 22 Z" fill="#FFF8D6" opacity="0.9" />
      </motion.g>

      {/* Wick */}
      <rect x="58.5" y="41" width="3" height="8" rx="1.5" fill="#3A1A0A" />

      {/* Bowl */}
      <path
        d="M10 54 C10 78 36 90 60 90 C84 90 110 78 110 54 C92 63 28 63 10 54 Z"
        fill={`url(#bowl-${uid})`}
      />
      {/* Rim + oil */}
      <ellipse cx="60" cy="54" rx="50" ry="9" fill="#B8581A" />
      <ellipse cx="60" cy="53" rx="44" ry="6.5" fill="#FFB347" opacity="0.9" />
      {/* Gold dot motif along the bowl */}
      {[28, 42, 60, 78, 92].map((x, i) => (
        <circle key={x} cx={x} cy={i === 2 ? 76 : i % 2 ? 72 : 70} r="2.4" fill={GOLD} opacity="0.9" />
      ))}
    </svg>
  );
}

/** Row of marigold beads strung across the top of the card. */
function Garland() {
  const beads = Array.from({ length: 13 });
  return (
    <div className="absolute inset-x-0 top-0 flex justify-between px-3 pointer-events-none" aria-hidden="true">
      {beads.map((_, i) => (
        <span
          key={i}
          className="block rounded-full"
          style={{
            width: 14,
            height: 14,
            marginTop: Math.abs(6 - i) * 0.9,
            background: i % 2 ? `radial-gradient(circle at 35% 35%, #FFD36B, ${SAFFRON})` : `radial-gradient(circle at 35% 35%, #FFB347, #D9650C)`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
          }}
        />
      ))}
    </div>
  );
}

/** Tiny four-point star that twinkles. */
function Spark({ className, delay }: { className: string; delay: number }) {
  return (
    <motion.svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      className={`absolute ${className} pointer-events-none`}
      animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.1, 0.7] }}
      transition={{ duration: 2.2, repeat: Infinity, delay, ease: "easeInOut" }}
      aria-hidden="true"
    >
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill={GOLD} />
    </motion.svg>
  );
}

export default function WelcomeOfferPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Homepage only — shows again on every visit/refresh there, no
    // "seen it already" gate.
    if (pathname !== "/") return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.35 },
        colors: [GOLD, SAFFRON, "#ffffff", "#C0392B"],
        startVelocity: 45,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleClose = () => setIsOpen(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMO_COUPON_CODE);
    toast.success(`Coupon code ${PROMO_COUPON_CODE} copied!`);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 z-[100]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            aria-label="Diwali offer"
            onClick={handleClose}
          >
            <div
              className="relative w-full max-w-[320px] sm:max-w-sm overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-[#F5C451]/40"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 38%, rgba(245,164,40,0.35) 0%, rgba(245,164,40,0) 55%), linear-gradient(170deg, #3B0A1E 0%, #5A1228 45%, #2A0A1A 100%)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Garland />
              <Spark className="top-16 left-5" delay={0} />
              <Spark className="top-24 right-6" delay={0.7} />
              <Spark className="top-40 left-9" delay={1.4} />
              <Spark className="top-36 right-10" delay={0.3} />

              <button
                onClick={handleClose}
                className="absolute top-8 right-3 sm:right-4 p-1.5 sm:p-2 rounded-full bg-white/15 hover:bg-white/25 text-[#FDEBC8] transition-colors z-10"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="relative px-5 pt-14 pb-6 sm:px-7 sm:pb-8 flex flex-col items-center text-center">
                <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: GOLD }}>
                  Shubh Deepavali
                </p>
                <h2 className="font-display font-black text-3xl sm:text-4xl leading-tight mt-1 text-[#FFF1D6]">
                  Happy Diwali!
                </h2>

                {/* Diyas */}
                <div className="flex items-end justify-center gap-2 sm:gap-3 mt-3 mb-1">
                  <div className="mb-1"><Diya size={62} delay={0.4} /></div>
                  <Diya size={104} />
                  <div className="mb-1"><Diya size={62} delay={0.9} /></div>
                </div>

                <p className="font-display font-black text-2xl sm:text-3xl leading-tight" style={{ color: GOLD }}>
                  {PROMO_COUPON_LABEL}
                </p>
                <p className="text-[#F3D9B1]/85 font-medium text-xs sm:text-sm mt-1.5 mb-4 sm:mb-5">
                  Light up your little one&apos;s festival — apply this code at checkout. 🐰
                </p>

                <button
                  onClick={handleCopy}
                  className="group w-full flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed px-4 py-2.5 sm:px-5 sm:py-3.5 mb-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ borderColor: GOLD, background: "rgba(245,196,81,0.10)" }}
                >
                  <span className="font-mono font-black text-base sm:text-lg tracking-widest" style={{ color: GOLD }}>
                    {PROMO_COUPON_CODE}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#F3D9B1]/80 group-hover:text-[#FFF1D6] transition-colors">
                    <Copy size={14} />
                    Copy
                  </span>
                </button>

                <a
                  href="/products"
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 font-bold py-3 sm:py-3.5 rounded-pill text-sm transition-all hover:shadow-soft-lg hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(90deg, ${GOLD}, ${SAFFRON})`, color: MAROON }}
                >
                  <ShoppingBag size={16} />
                  Copy Code &amp; Shop Now
                </a>

                <button
                  onClick={handleClose}
                  className="text-xs font-medium mt-3 sm:mt-4 text-[#F3D9B1]/60 hover:text-[#FFF1D6] transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
