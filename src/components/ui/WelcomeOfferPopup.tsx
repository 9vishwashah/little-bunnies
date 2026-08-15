"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Copy, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { PROMO_COUPON_CODE, PROMO_COUPON_LABEL } from "@/lib/utils";

const SAFFRON = "#FF9933";
const INDIA_GREEN = "#138808";
const CHAKRA_NAVY = "#000088";

// Routes where popping up a promo would get in the way of an active task.
const SUPPRESSED_PATHS = ["/checkout", "/cart"];

/** A simplified 24-spoke Ashoka Chakra, drawn as plain SVG lines. */
function AshokaChakra({ size = 40 }: { size?: number }) {
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24;
    const rad = (angle * Math.PI) / 180;
    const x2 = 50 + 42 * Math.cos(rad);
    const y2 = 50 + 42 * Math.sin(rad);
    return <line key={i} x1={50} y1={50} x2={x2} y2={y2} stroke={CHAKRA_NAVY} strokeWidth={2.5} />;
  });

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx={50} cy={50} r={44} fill="none" stroke={CHAKRA_NAVY} strokeWidth={4} />
      {spokes}
      <circle cx={50} cy={50} r={5} fill={CHAKRA_NAVY} />
    </svg>
  );
}

export default function WelcomeOfferPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (SUPPRESSED_PATHS.some((p) => pathname?.startsWith(p))) return;

    // No "seen it already" gate — this fires on every fresh page load
    // (first visit or a refresh) by design, not just once per session.
    const timer = setTimeout(() => {
      setIsOpen(true);

      const colors = [SAFFRON, "#ffffff", INDIA_GREEN];
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.35 }, colors, startVelocity: 45 });
      confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.4 }, colors });
      confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.4 }, colors });
    }, 900);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            aria-label="Independence Day special offer"
            onClick={handleClose}
          >
            <div
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tricolor ribbon */}
              <div className="h-3 w-full flex">
                <div className="flex-1" style={{ backgroundColor: SAFFRON }} />
                <div className="flex-1 bg-white" />
                <div className="flex-1" style={{ backgroundColor: INDIA_GREEN }} />
              </div>

              <button
                onClick={handleClose}
                className="absolute top-5 right-4 p-2 rounded-full bg-cream-dark hover:bg-cream-darker transition-colors z-10"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="px-7 pt-7 pb-8 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -60 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 14, delay: 0.15 }}
                  className="mb-3"
                >
                  <AshokaChakra size={44} />
                </motion.div>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-pill bg-cream-dark mb-3">
                  <span className="text-[11px] font-bold text-ink tracking-widest uppercase">
                    Independence Day Special
                  </span>
                </div>

                <h2 className="font-display font-black text-ink text-2xl sm:text-3xl leading-tight mb-2">
                  Celebrate Freedom.
                  <br />
                  Save Big!
                </h2>

                <p className="text-ink-muted font-medium text-sm mb-6">
                  Get <span className="font-bold" style={{ color: INDIA_GREEN }}>{PROMO_COUPON_LABEL}</span>.
                </p>

                <button
                  onClick={handleCopy}
                  className="group w-full flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed px-5 py-3.5 mb-5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ borderColor: SAFFRON, background: "linear-gradient(135deg, rgba(255,153,51,0.08), rgba(19,136,8,0.08))" }}
                >
                  <span
                    className="font-mono font-black text-lg tracking-widest"
                    style={{ color: CHAKRA_NAVY }}
                  >
                    {PROMO_COUPON_CODE}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-ink-muted group-hover:text-ink transition-colors">
                    <Copy size={14} />
                    Copy
                  </span>
                </button>

                <a
                  href="/products"
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-pill text-sm transition-all hover:shadow-soft-lg hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(90deg, ${SAFFRON}, ${INDIA_GREEN})` }}
                >
                  <ShoppingBag size={16} />
                  Copy Code &amp; Shop Now
                </a>

                <button
                  onClick={handleClose}
                  className="text-xs text-ink-muted font-medium mt-4 hover:text-ink transition-colors"
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
