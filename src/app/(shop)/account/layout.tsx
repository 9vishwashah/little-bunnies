import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Package, Heart, LogOut } from "lucide-react";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="section-container section-spacing bg-cream min-h-[calc(100vh-80px)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-brand shadow-card p-5 sticky top-24">
            <h2 className="font-display font-semibold text-ink text-xl mb-6 px-3">My Account</h2>
            <nav className="space-y-1">
              <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-ink hover:bg-cream-dark transition-colors">
                <User size={18} className="text-ink-muted" />
                Profile Details
              </Link>
              <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-ink hover:bg-cream-dark transition-colors">
                <Package size={18} className="text-ink-muted" />
                Order History
              </Link>
              {/* Note: Wishlist is currently handled by Zustand and doesn't require login, but we could link to a dedicated page later */}
            </nav>
            <div className="mt-8 pt-6 border-t border-ink/8 px-3">
              <Link href="/sign-out" className="flex items-center gap-3 text-sm font-medium text-blush-dark hover:text-blush transition-colors">
                <LogOut size={18} />
                Sign Out
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
