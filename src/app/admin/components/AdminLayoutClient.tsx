"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  // Close drawer on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    if (isSidebarOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isSidebarOpen, closeSidebar]);

  return (
    <div className="flex h-screen bg-cream overflow-hidden">

      {/* ── DESKTOP SIDEBAR ──────────────────────────────────── */}
      <div className="hidden md:block w-60 flex-shrink-0 h-full bg-ink">
        <AdminSidebar />
      </div>

      {/* ── MOBILE BACKDROP ──────────────────────────────────── */}
      {isSidebarOpen && (
        <div
          aria-hidden="true"
          onClick={closeSidebar}
          onTouchEnd={(e) => {
            e.preventDefault();
            closeSidebar();
          }}
          className="fixed inset-0 z-40 bg-ink/50 md:hidden"
          style={{ WebkitTapHighlightColor: "transparent" }}
        />
      )}

      {/* ── MOBILE DRAWER ────────────────────────────────────── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 h-full bg-ink transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onClose={closeSidebar} />
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto flex flex-col">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3.5 bg-white border-b border-cream-dark sticky top-0 z-30 shadow-sm">
          <span className="font-display font-bold text-ink text-base">
            Little Bunnies{" "}
            <span className="text-ink-muted font-medium text-xs">Admin</span>
          </span>
          <button
            type="button"
            onClick={openSidebar}
            aria-label="Open navigation menu"
            className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-cream-dark transition-colors"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Page content */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
