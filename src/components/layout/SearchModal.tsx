"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 bg-cream z-[90] shadow-soft-xl"
          >
            <div className="section-container py-4">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <Search size={22} className="text-ink-muted flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products, brands..."
                  className="flex-1 bg-transparent text-ink text-lg font-medium placeholder-ink-muted outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1.5 rounded-lg hover:bg-cream-dark transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-cream-dark transition-colors text-sm font-semibold text-ink-muted"
                >
                  Cancel
                </button>
              </form>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
