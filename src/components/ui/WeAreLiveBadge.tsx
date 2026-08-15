"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * A standalone floating "We're Live!" stamp — sits in the bottom-right
 * corner independently of any other UI (stacked above the WhatsApp button,
 * not attached to it or to the offer popup).
 */
export default function WeAreLiveBadge() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20, opacity: 0 }}
      animate={{ scale: 1, rotate: -8, opacity: 1 }}
      transition={{ delay: 1.8, type: "spring", stiffness: 260, damping: 14 }}
      whileHover={{ scale: 1.06, rotate: 0 }}
      className="fixed bottom-28 right-4 md:bottom-32 md:right-6 z-40"
    >
      <div className="relative">
        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
          className="absolute inset-0 rounded-full bg-sage"
        />

        {/* Stamp face */}
        <div className="relative w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] md:w-20 md:h-20 rounded-full bg-white shadow-soft-lg border-2 border-dashed border-sage-dark flex items-center justify-center p-2">
          <Image
            src="/images/only-bunny-removebg-preview.png"
            alt=""
            width={48}
            height={48}
            className="object-contain w-full h-full"
          />
        </div>

        {/* "We're Live" ribbon, stamped across the bottom edge */}
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-sage-dark text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          We&apos;re Live
        </span>
      </div>
    </motion.div>
  );
}
