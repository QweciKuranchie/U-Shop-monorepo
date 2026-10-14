import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { SanityLive } from "@repo/sanity/live";
import { Toaster } from "sonner";
import AuthModal from "@/components/auth/AuthModal";
import ScrollToTop from "@/components/ScrollToTop";
import MotionProvider from "@/components/MotionProvider";
import { getNavCategories } from "@repo/sanity/queries";

export const metadata: Metadata = {
  title: "U-Shop",
  description: "U-Shop, Ghana's trusted tech e-commerce platform for buyers and sellers",
  icons: {
    icon: [
      { url: "/assets/logos/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/logos/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logos/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/logos/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/assets/logos/favicon/favicon.ico",
    apple: [
      { url: "/assets/logos/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navCategories = await getNavCategories();
  return (
    <UserDataProvider>
      <MotionProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ushop-purple-dark focus:shadow-lg focus:ring-2 focus:ring-ushop-purple"
      >
        Skip to main content
      </a>
      <div className="min-h-screen flex flex-col">
        <Header navCategories={navCategories} />
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
      </div>
      </MotionProvider>
      <SpeedInsights />
      <Analytics /> 
      <SanityLive />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#ffffff",
            color: "#520f85",
            border: "1px solid rgba(212, 0, 155, 0.25)",
            boxShadow: "0 10px 25px -5px rgba(107, 31, 168, 0.15)",
            borderRadius: "0.85rem",
            fontFamily: "var(--font-sans), sans-serif",
            fontWeight: 500,
          },
        }}
      />
      <ScrollToTop />
      <AuthModal />
    </UserDataProvider>
  );
}
