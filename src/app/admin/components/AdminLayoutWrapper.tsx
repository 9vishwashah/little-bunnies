"use client";

import dynamic from "next/dynamic";

// ssr: false means this component is NEVER rendered on the server.
// The server sends an empty placeholder; the client renders the full layout.
// This makes hydration mismatches IMPOSSIBLE because there is no server HTML to compare against.
const AdminLayoutClient = dynamic(
  () => import("./AdminLayoutClient"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen bg-cream overflow-hidden">
        {/* Skeleton sidebar for desktop */}
        <div className="hidden md:block w-60 flex-shrink-0 h-full bg-ink" />
        {/* Skeleton main area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-ink-muted text-sm">Loading admin…</div>
        </div>
      </div>
    ),
  }
);

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
