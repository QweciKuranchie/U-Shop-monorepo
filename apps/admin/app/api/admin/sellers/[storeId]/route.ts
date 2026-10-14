import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { verifyIsAdmin } from "@/lib/adminAuth";
import { backendClient } from "@repo/sanity";
import { createAdminClient } from "@repo/supabase/admin";
import { logAdminAction } from "@/lib/adminLog";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyIsAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { storeId } = await params;
    if (!storeId) {
      return NextResponse.json({ error: "storeId is required" }, { status: 400 });
    }

    const body = await request.json();
    const { action, reason, reviewedBy } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const reviewer = reviewedBy || `admin-${userId}`;

    // 1. Fetch store from Sanity
    const sanityStore = await backendClient.fetch(
      `*[_type == "store" && _id == $storeId][0]`,
      { storeId }
    );

    if (!sanityStore) {
      return NextResponse.json({ error: "Store not found in Sanity" }, { status: 404 });
    }

    const isStudent = sanityStore.sellerType === "student";

    if (action === "approve") {
      // Patch Sanity store
      await backendClient
        .patch(storeId)
        .set({
          status: "active",
          kycStatus: "approved",
          verifiedSeller: true,
          verifiedStudent: isStudent,
          kycReviewedAt: now,
          kycReviewedBy: reviewer,
          kycRejectionReason: "",
        })
        .commit();

      // Sync to Supabase if configured
      if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        try {
          const supabase = createAdminClient();
          const supabaseStoreId = sanityStore.storeId || storeId;

          // Find store in Supabase
          const { data: sbStore } = await supabase
            .from("stores")
            .select("id, seller_id")
            .or(`id.eq.${supabaseStoreId},sanity_store_id.eq.${storeId}`)
            .maybeSingle();

          if (sbStore) {
            await (supabase.from("stores") as any)
              .update({ status: "active", updated_at: now })
              .eq("id", sbStore.id);

            await (supabase.from("sellers") as any)
              .update({ status: "active", updated_at: now })
              .eq("id", sbStore.seller_id);

            await (supabase.from("kyc_submissions") as any)
              .update({
                status: "approved",
                reviewed_at: now,
                reviewed_by: reviewer,
              })
              .eq("seller_id", sbStore.seller_id);
          }
        } catch (sbErr) {
          console.error("Supabase sync error on approve:", sbErr);
        }
      }

      await logAdminAction("info", "Seller KYC approved", { storeId, store: sanityStore.name }, userId);
      return NextResponse.json({
        success: true,
        message: `Store "${sanityStore.name}" approved successfully.`,
      });
    } else {
      const rejectionReason = reason || "KYC verification documents could not be verified.";

      // Patch Sanity store
      await backendClient
        .patch(storeId)
        .set({
          status: "rejected",
          kycStatus: "rejected",
          verifiedSeller: false,
          kycReviewedAt: now,
          kycReviewedBy: reviewer,
          kycRejectionReason: rejectionReason,
        })
        .commit();

      // Sync to Supabase if configured
      if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        try {
          const supabase = createAdminClient();
          const supabaseStoreId = sanityStore.storeId || storeId;

          const { data: sbStore } = await supabase
            .from("stores")
            .select("id, seller_id")
            .or(`id.eq.${supabaseStoreId},sanity_store_id.eq.${storeId}`)
            .maybeSingle();

          if (sbStore) {
            await (supabase.from("stores") as any)
              .update({ status: "rejected", updated_at: now })
              .eq("id", sbStore.id);

            await (supabase.from("sellers") as any)
              .update({ status: "rejected", updated_at: now })
              .eq("id", sbStore.seller_id);

            await (supabase.from("kyc_submissions") as any)
              .update({
                status: "rejected",
                rejection_reason: rejectionReason,
                reviewed_at: now,
                reviewed_by: reviewer,
              })
              .eq("seller_id", sbStore.seller_id);
          }
        } catch (sbErr) {
          console.error("Supabase sync error on reject:", sbErr);
        }
      }

      await logAdminAction("warn", "Seller KYC rejected", { storeId, store: sanityStore.name, reason: rejectionReason }, userId);
      return NextResponse.json({
        success: true,
        message: `Store "${sanityStore.name}" KYC rejected.`,
      });
    }
  } catch (error: unknown) {
    console.error("Admin KYC review API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
