"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Copy, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PROMO_COUPON_CODE, PROMO_COUPON_LABEL } from "@/lib/utils";

export default function WelcomeOfferPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Homepage only — but shows again on every visit/refresh there, no
    // "seen it already" gate.
    if (pathname !== "/") return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.35 },
        colors: ["#A592CF", "#8FAD78", "#FBF8F3"],
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
            className="fixed inset-0 bg-black/20 z-[100]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            aria-label="Welcome offer"
            onClick={handleClose}
          >
            <div
              className="relative bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl w-full max-w-[320px] sm:max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Brand gradient header */}
              <div
                className="relative px-5 pt-8 pb-14 sm:px-7 sm:pt-10 sm:pb-16 text-center overflow-hidden"
                style={{ background: "linear-gradient(135deg, var(--color-lavender-brand), var(--color-sage-light))" }}
              >
                <button
                  onClick={handleClose}
                  className="absolute top-3.5 right-3 sm:top-5 sm:right-4 p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white shadow-soft transition-colors z-10"
                  aria-label="Close"
                >
                  <X size={16} className="sm:hidden" />
                  <X size={18} className="hidden sm:block" />
                </button>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-white/70 backdrop-blur-sm mb-3">
                  <Sparkles size={12} className="text-lavender-brand-dark" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-ink tracking-widest uppercase">
                    Welcome to Little Bunnies
                  </span>
                </div>

                <h2 className="font-display font-black text-ink text-2xl sm:text-4xl leading-tight">
                  {PROMO_COUPON_LABEL}
                </h2>
              </div>

              <div className="relative px-5 pb-5 sm:px-7 sm:pb-8 -mt-8 sm:-mt-9 flex flex-col items-center text-center">
                <p className="text-ink-muted font-medium text-xs sm:text-sm mb-4 sm:mb-5">
                  Apply this code at checkout to save on your first order. 🐰
                </p>

                <button
                  onClick={handleCopy}
                  className="group w-full flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-sage-dark/50 bg-sage-light/30 px-4 py-2.5 sm:px-5 sm:py-3.5 mb-4 sm:mb-5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="font-mono font-black text-base sm:text-lg tracking-widest text-ink">
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
                  className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 sm:py-3.5 rounded-pill text-sm transition-all hover:shadow-soft-lg hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(90deg, var(--color-lavender-brand-dark), var(--color-sage-dark))" }}
                >
                  <ShoppingBag size={16} />
                  Copy Code &amp; Shop Now
                </a>

                <button
                  onClick={handleClose}
                  className="text-xs text-ink-muted font-medium mt-3 sm:mt-4 hover:text-ink transition-colors"
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
