import type { Metadata } from "next";
import { createServerClient } from "@repo/supabase/server";
import SellerLanding from "../components/landing/SellerLanding";

export const metadata: Metadata = {
  title: "Sell technology on U-Shop | Seller Center",
  description:
    "Create your U-Shop tech storefront, submit your store for review, and manage products and customer orders in one place.",
  openGraph: {
    title: "Sell technology on U-Shop | Seller Center",
    description: "Create your tech storefront and manage your products and customer orders with U-Shop Seller Center.",
    type: "website",
    siteName: "U-Shop",
  },
  twitter: { card: "summary" },
};

export default async function SellerLandingPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <SellerLanding startHref={user ? "/dashboard" : "/sign-up"} dashboardHref={user ? "/dashboard" : "/sign-in?redirect_url=%2Fdashboard"} />;
}
