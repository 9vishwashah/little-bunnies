import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminLayoutWrapper from "./components/AdminLayoutWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
