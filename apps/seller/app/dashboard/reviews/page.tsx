export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createServerClient } from "@repo/supabase/server";
import { client } from "@repo/sanity";
import { SELLER_STORE_QUERY } from "@repo/sanity/queries";
import { ReviewReplies, type SellerReview } from "@/components/reviews/ReviewReplies";

export default async function ReviewsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const store = await client.fetch(SELLER_STORE_QUERY, { userId: user.id });
  const reviews: SellerReview[] = store
    ? await client.fetch(
        `*[_type == "review" && status == "approved" && product->store._ref == $storeId] | order(_createdAt desc)[0...100]{
          _id, rating, title, content, isVerifiedPurchase, sellerReply,
          "createdAt": _createdAt,
          "productName": product->name,
          "reviewer": coalesce(user->firstName, "Customer")
        }`,
        { storeId: store._id }
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Reply publicly to buyers. Replying to both good and bad reviews builds trust. Reviews without a reply are shown first.
        </p>
      </div>
      <ReviewReplies reviews={reviews} />
    </div>
  );
}
