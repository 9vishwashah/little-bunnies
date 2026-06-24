import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
