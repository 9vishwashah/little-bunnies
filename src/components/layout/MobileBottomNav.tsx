"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const isActive = pathname === "/";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-md border-t border-ink/8 safe-bottom md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-center px-2 py-2">
        <Link
          href="/"
          className={cn(
            "relative flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-xl transition-colors",
            isActive ? "text-ink" : "text-ink-muted hover:text-ink-light"
          )}
        >
          <div className={cn("p-1.5 rounded-xl transition-colors", isActive && "bg-sky-brand")}>
            <Home size={22} strokeWidth={isActive ? 2.5 : 1.8} />
          </div>
          <span className={cn("text-[10px] font-semibold", isActive ? "text-ink" : "text-ink-muted")}>
            Home
          </span>
          {isActive && (
            <motion.div
              layoutId="mobile-nav-dot"
              className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-ink"
            />
          )}
        </Link>
      </div>
    </nav>
  );
}

