import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import StoreHydration from "@/components/StoreHydration";
import WelcomeOfferPopup from "@/components/ui/WelcomeOfferPopup";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StoreHydration />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppFloat />
      <WelcomeOfferPopup />
    </>
  );
}

