import { createServerClient } from "@repo/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Store } from "lucide-react";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import type { SellerType } from "@repo/supabase/types";

export default async function CreateStorePage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if seller profile and store already exist
  const { data: seller } = await supabase
    .from("sellers")
    .select("id, seller_type, first_name, last_name, phone, status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (seller) {
    const { data: store } = await supabase
      .from("stores")
      .select("id, status")
      .eq("seller_id", seller.id)
      .maybeSingle();

    if (store?.status === "active") {
      redirect("/dashboard");
    }

    if (store?.status === "pending_review") {
      redirect("/pending-review");
    }
  }

  const meta = user.user_metadata || {};
  const requestedType = (await searchParams).type;
  const oauthSellerType = requestedType === "business" || requestedType === "student" ? requestedType : "personal";

  const initialProfile = {
    email: user.email || "",
    phone: seller?.phone || meta.phone || "",
    firstName: seller?.first_name || meta.first_name || "",
    lastName: seller?.last_name || meta.last_name || "",
    sellerType: (seller?.seller_type || meta.seller_type || oauthSellerType) as SellerType,
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 py-12 text-slate-100">
      <div className="mb-6 flex flex-col items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[2px] shadow-xl shadow-purple-500/20 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Store className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              U-Shop
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit">
              Seller Onboarding & KYC
            </span>
          </div>
        </Link>
      </div>

      <OnboardingWizard initialProfile={initialProfile} />
    </div>
  );
}
