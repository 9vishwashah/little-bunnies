"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Copy, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { PROMO_COUPON_CODE, PROMO_COUPON_LABEL } from "@/lib/utils";

const RAKHI_GOLD = "#C9971D";
const RAKHI_MAROON = "#8E2439";

// Routes where popping up a promo would get in the way of an active task.
const SUPPRESSED_PATHS = ["/checkout", "/cart"];

export default function WelcomeOfferPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (SUPPRESSED_PATHS.some((p) => pathname?.startsWith(p))) return;

    // No "seen it already" gate — this fires on every fresh page load
    // (first visit or a refresh) by design, not just once per session.
    const timer = setTimeout(() => {
      setIsOpen(true);

      const colors = [RAKHI_GOLD, "#ffffff", RAKHI_MAROON];
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
            aria-label="Rakhi celebration offer"
            onClick={handleClose}
          >
            <div
              className="relative bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl w-full max-w-[320px] sm:max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Rakhi photo, filling the entire card — zoomed in and
                  nudged up so the rakhi itself is the prominent, in-frame
                  subject instead of sitting small and low behind the code
                  box. */}
              <div className="absolute inset-0">
                <Image
                  src="/images/rakhi-celebration.png"
                  alt=""
                  fill
                  className="object-cover"
                  style={{ transform: "scale(1.35) translateY(-6%)", transformOrigin: "50% 48%" }}
                  priority
                />
                {/* Scrim so text stays readable over the photo — stays
                    light through the middle (where the rakhi itself sits, so
                    it doesn't get washed out), only turning solid right at
                    the bottom behind the code box and CTA. */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.18) 48%, rgba(255,255,255,0.7) 72%, rgba(255,255,255,0.95) 85%, #fff 93%)",
                  }}
                />
              </div>

              {/* Gold/maroon festive ribbon */}
              <div className="relative h-2.5 sm:h-3 w-full flex">
                <div className="flex-1" style={{ backgroundColor: RAKHI_GOLD }} />
                <div className="flex-1" style={{ backgroundColor: RAKHI_MAROON }} />
              </div>

              <button
                onClick={handleClose}
                className="absolute top-3.5 right-3 sm:top-5 sm:right-4 p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white shadow-soft transition-colors z-10"
                aria-label="Close"
              >
                <X size={16} className="sm:hidden" />
                <X size={18} className="hidden sm:block" />
              </button>

              <div className="relative px-5 pt-14 pb-5 sm:px-7 sm:pt-20 sm:pb-8 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-pill bg-cream-dark mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-[11px] font-bold text-ink tracking-widest uppercase">
                    Rakhi Special
                  </span>
                </div>

                <h2 className="font-display font-black text-ink text-xl sm:text-3xl leading-tight mb-2 sm:mb-3">
                  Rakhi Celebration
                </h2>

                <p className="inline-block rounded-lg bg-white/85 backdrop-blur-sm px-3 py-1.5 text-ink-muted font-medium text-xs sm:text-sm mb-6 sm:mb-8">
                  Get <span className="font-bold" style={{ color: RAKHI_MAROON }}>{PROMO_COUPON_LABEL}</span> this
                  Raksha Bandhan.
                </p>

                <button
                  onClick={handleCopy}
                  className="group w-full flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed px-4 py-2.5 sm:px-5 sm:py-3.5 mb-4 sm:mb-5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ borderColor: RAKHI_GOLD, background: "linear-gradient(135deg, rgba(201,151,29,0.08), rgba(142,36,57,0.08))" }}
                >
                  <span
                    className="font-mono font-black text-base sm:text-lg tracking-widest"
                    style={{ color: RAKHI_MAROON }}
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
                  className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 sm:py-3.5 rounded-pill text-sm transition-all hover:shadow-soft-lg hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(90deg, ${RAKHI_GOLD}, ${RAKHI_MAROON})` }}
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
