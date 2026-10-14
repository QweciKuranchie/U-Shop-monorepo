import { createServerClient } from "@repo/supabase/server";
import { redirect } from "next/navigation";
import { backendClient } from "@repo/sanity";
import { SellerSidebar } from "@/components/layout/SellerSidebar";
import { SellerHeader } from "@/components/layout/SellerHeader";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastContainer } from "react-toastify";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // 1. Check Supabase for seller profile and store
  const { data: seller } = await supabase
    .from("sellers")
    .select("id, email, seller_type, status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  let store = null;

  if (seller) {
    const { data: supabaseStore } = await supabase
      .from("stores")
      .select("id, name, slug, status, sanity_store_id")
      .eq("seller_id", seller.id)
      .maybeSingle();

    store = supabaseStore;
  }

  // 2. Fallback check in Sanity for backwards compatibility
  let sanityStore = null;
  if (!store || !store.name) {
    sanityStore = await backendClient.fetch(
      `*[_type == "store" && (supabaseUserId == $userId || clerkUserId == $userId)][0]`,
      { userId: user.id }
    );
  }

  const effectiveStore = store || sanityStore;

  if (!effectiveStore) {
    redirect("/create-store");
  }

  // Both the seller and store must be active before operational tools are shown.
  if (seller?.status === "rejected" || effectiveStore.status === "rejected") {
    redirect("/rejected");
  }

  if (seller?.status === "suspended" || effectiveStore.status === "suspended") {
    redirect("/suspended");
  }

  if ((seller && seller.status !== "active") || effectiveStore.status !== "active") {
    redirect("/pending-review");
  }

  const storeName = effectiveStore.name || "My Store";

  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="flex min-h-screen bg-background">
          <SellerSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <SellerHeader
              storeName={storeName}
              sellerEmail={user.email}
              sellerType={seller?.seller_type || "personal"}
            />
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
          </div>
        </div>
        <ToastContainer position="bottom-right" />
      </ThemeProvider>
    </QueryProvider>
  );
}
