"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Copy, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { PROMO_COUPON_CODE } from "@/lib/utils";

const GANPATI_SAFFRON = "#E8871E";
const GANPATI_MAROON = "#8E2439";

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
        colors: [GANPATI_SAFFRON, GANPATI_MAROON, "#ffffff"],
        startVelocity: 45,
      });
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            aria-label="Ganpati festival offer"
            onClick={handleClose}
          >
            <div
              className="relative bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl w-full max-w-[300px] sm:max-w-[360px] aspect-[4/5] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo fills the entire card — this crop has no text of its
                  own, so the greeting lives in the pill/heading below and
                  the code + CTA sit in a scrim strip at the bottom. */}
              <div className="absolute inset-0">
                <Image
                  src="/images/LB_Ganesha.png"
                  alt="Happy Ganesh Chaturthi — Little Bunnies"
                  fill
                  className="object-cover object-top"
                  priority
                />
                {/* Top scrim so the greeting pill stays legible over
                    whatever part of the photo sits behind it. */}
                <div
                  className="absolute inset-x-0 top-0 h-24 sm:h-28"
                  style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0))" }}
                />
                {/* Bottom scrim — stays clear over most of the photo and
                    only turns solid right behind the code box / CTA. */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 54%, rgba(255,255,255,0.55) 66%, rgba(255,255,255,0.92) 80%, #fff 90%)",
                  }}
                />
              </div>

              {/* Saffron/maroon festive ribbon */}
              <div className="relative h-2.5 sm:h-3 w-full flex">
                <div className="flex-1" style={{ backgroundColor: GANPATI_SAFFRON }} />
                <div className="flex-1" style={{ backgroundColor: GANPATI_MAROON }} />
              </div>

              <div className="relative pt-3 px-4 sm:pt-4 sm:px-6">
                <span className="inline-block text-white font-display font-black text-lg sm:text-2xl leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                  Happy Ganesh Chaturthi 🪔
                </span>
              </div>

              <button
                onClick={handleClose}
                className="absolute top-3.5 right-3 sm:top-5 sm:right-4 p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white shadow-soft transition-colors z-10"
                aria-label="Close"
              >
                <X size={16} className="sm:hidden" />
                <X size={18} className="hidden sm:block" />
              </button>

              <div className="absolute inset-x-0 bottom-0 px-4 pb-4 sm:px-6 sm:pb-6 flex flex-col items-center text-center">
                <button
                  onClick={handleCopy}
                  className="group w-full flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed px-4 py-2.5 sm:px-5 sm:py-3 mb-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ borderColor: GANPATI_SAFFRON, background: "linear-gradient(135deg, rgba(232,135,30,0.08), rgba(142,36,57,0.08))" }}
                >
                  <span className="font-mono font-black text-sm sm:text-base tracking-widest" style={{ color: GANPATI_MAROON }}>
                    {PROMO_COUPON_CODE}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-ink-muted group-hover:text-ink transition-colors">
                    <Copy size={13} />
                    Copy
                  </span>
                </button>

                <a
                  href="/products"
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 text-white font-bold py-2.5 sm:py-3 rounded-pill text-sm transition-all hover:shadow-soft-lg hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(90deg, ${GANPATI_SAFFRON}, ${GANPATI_MAROON})` }}
                >
                  <ShoppingBag size={15} />
                  Copy Code &amp; Shop Now
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
