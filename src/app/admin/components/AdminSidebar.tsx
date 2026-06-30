"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Grid2X2,
  ShoppingCart,
  Users,
  Star,
  ChevronRight,
  Store,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Grid2X2 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  // Every nav tap closes the drawer (works even if pathname doesn't change)
  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <aside className="w-full h-full bg-ink text-cream flex flex-col overflow-y-auto">
      {/* Logo + Close */}
      <div className="px-5 py-5 border-b border-cream/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cream/10 flex items-center justify-center">
            <Store size={16} className="text-cream" />
          </div>
          <div>
            <p className="font-display font-bold text-cream text-sm leading-tight">
              Little Bunnies
            </p>
            <p className="text-cream/40 text-xs font-medium">Admin Panel</p>
          </div>
        </div>
        {/* Close button — visible on mobile only */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            onTouchEnd={(e) => {
              e.preventDefault();
              onClose();
            }}
            aria-label="Close menu"
            className="md:hidden p-2 text-cream/60 hover:text-cream hover:bg-cream/10 rounded-lg transition-colors active:bg-cream/20"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="text-cream/30 text-xs font-bold uppercase tracking-widest px-3 mb-3">
          Management
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors group",
                  active
                    ? "bg-cream/15 text-cream"
                    : "text-cream/60 hover:bg-cream/8 hover:text-cream"
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                <span className="flex-1">{label}</span>
                {active && (
                  <motion.div layoutId="admin-nav-active">
                    <ChevronRight size={14} className="text-cream/40" />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Visit store link */}
      <div className="px-3 pb-2">
        <Link
          href="/"
          target="_blank"
          onClick={handleNavClick}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-cream/50 hover:text-cream hover:bg-cream/8 transition-colors font-medium"
        >
          <Store size={15} />
          Visit Store
        </Link>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t border-cream/10 flex items-center gap-3">
        <UserButton
          appearance={{ elements: { avatarBox: "w-8 h-8" } }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-cream text-xs font-semibold truncate">Admin</p>
          <p className="text-cream/40 text-xs">Signed in</p>
        </div>
      </div>
    </aside>
  );
}
